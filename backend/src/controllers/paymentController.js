import prisma from '../lib/prisma.js';
import {
    sendWaafiPayment,
    isWaafiPaymentSuccess,
    getWaafiErrorMessage,
    getWaafiTransactionId
} from '../utils/waafiPayment.js';
import {
    applyStudentDiscount,
    computeFundingAmount,
    getEffectiveMonthlyPrice,
    getProgramByTitle,
    resolvePaidMonths,
    addMonths,
} from '../utils/studentPaymentUtils.js';

async function extendSubscription(studentEmail, packageId, paidAmount) {
    try {
        const student = await prisma.students.findUnique({ where: { email: studentEmail } });
        const pkg = await prisma.payment_packages.findUnique({ where: { id: parseInt(packageId, 10) } });

        if (!student || !pkg) return null;

        const durationMonths = parseInt(pkg.duration_months, 10) || 1;
        const now = new Date();
        const currentPaidUntil = student.paid_until ? new Date(student.paid_until) : now;
        const baseDate = currentPaidUntil > now ? currentPaidUntil : now;
        const newPaidUntil = addMonths(baseDate, durationMonths);

        const program = await getProgramByTitle(prisma, student.chosen_program);
        const monthly = getEffectiveMonthlyPrice(program);
        const baseTotal = monthly * durationMonths;
        const expectedAmount = await computeFundingAmount(prisma, {
            funding_status: student.funding_status,
            scholarship_percentage: student.scholarship_percentage,
            sponsorship_package: student.sponsorship_package,
            chosen_program: student.chosen_program,
            paid_months: durationMonths,
        });

        const updated = await prisma.students.update({
            where: { student_id: student.student_id },
            data: {
                paid_until: newPaidUntil,
                funding_status: student.funding_status === 'Full Scholarship' ? 'Full Scholarship' : 'Paid',
                funding_amount: paidAmount ?? expectedAmount ?? baseTotal,
                funding_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            },
        });

        return updated;
    } catch (err) {
        console.error('Failed to extend subscription:', err);
        return null;
    }
}

export const createEvcPayment = async (req, res) => {
    try {
        const { student, programId, amount, accountNumber } = req.body;
        if (!student || !amount) return res.status(400).json({ success: false, error: 'Missing data' });

        const transactionId = `EVC-${Date.now()}`;
        const studentData = await prisma.students.findUnique({ where: { email: student.email } });

        if (studentData) {
            await prisma.payments.create({
                data: {
                    student_id: studentData.student_id,
                    method: 'evc',
                    provider_transaction_id: transactionId,
                    amount: parseFloat(amount),
                    status: 'paid',
                    payer_phone: accountNumber,
                    program_id: String(programId),
                }
            });
            await extendSubscription(student.email, programId, parseFloat(amount));
        }

        res.json({ success: true, transactionId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const createWaafiPayment = async (req, res) => {
    try {
        const { payerPhone, amount, programId, studentEmail } = req.body;
        if (!payerPhone || amount === undefined || amount === null) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }

        const student = studentEmail
            ? await prisma.students.findUnique({ where: { email: studentEmail } })
            : null;

        const pkg = programId
            ? await prisma.payment_packages.findUnique({ where: { id: parseInt(programId, 10) } })
            : null;

        let payableAmount = parseFloat(amount);
        if (student && pkg) {
            const program = await getProgramByTitle(prisma, student.chosen_program);
            const monthly = getEffectiveMonthlyPrice(program);
            const baseTotal = monthly * (pkg.duration_months || 1);
            payableAmount = applyStudentDiscount(baseTotal, student);
        }

        if (payableAmount <= 0 && student) {
            const updated = await extendSubscription(studentEmail, programId, 0);
            return res.json({
                success: true,
                transactionId: `SCHOLARSHIP-${Date.now()}`,
                paidUntil: updated?.paid_until,
                message: 'No payment required. Access extended.',
            });
        }

        const transactionId = `WAAFI-${Date.now()}`;
        const json = await sendWaafiPayment({
            transactionId,
            accountNo: payerPhone,
            amount: payableAmount,
            description: 'BEA Payment'
        });

        const isSuccess = isWaafiPaymentSuccess(json);

        if (student) {
            await prisma.payments.create({
                data: {
                    student_id: student.student_id,
                    method: 'waafi',
                    provider_transaction_id: getWaafiTransactionId(json, transactionId),
                    amount: payableAmount,
                    status: isSuccess ? 'paid' : 'failed',
                    payer_phone: payerPhone,
                    program_id: String(programId),
                }
            });

            if (isSuccess) {
                const updated = await extendSubscription(studentEmail, programId, payableAmount);
                return res.json({
                    success: true,
                    transactionId,
                    paidUntil: updated?.paid_until,
                    amount: payableAmount,
                    raw: json,
                });
            }
        }

        if (!isSuccess) return res.status(400).json({ success: false, error: getWaafiErrorMessage(json) });
        res.json({ success: true, transactionId, amount: payableAmount, raw: json });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await prisma.payments.findMany({
            orderBy: { created_at: 'desc' }
        });

        const populatedPayments = await Promise.all(payments.map(async (payment) => {
            let student = null;
            if (payment.student_id) {
                student = await prisma.students.findUnique({
                    where: { student_id: payment.student_id }
                });
            }
            return {
                ...payment,
                students: student
            };
        }));

        res.json(populatedPayments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStudentPayments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payments = await prisma.payments.findMany({
            where: { student_id: studentId },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

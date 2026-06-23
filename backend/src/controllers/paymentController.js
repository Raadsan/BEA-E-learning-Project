import prisma from '../lib/prisma.js';
import {
    sendWaafiPayment,
    isWaafiPaymentSuccess,
    getWaafiErrorMessage,
    getWaafiTransactionId
} from '../utils/waafiPayment.js';
import {
    calculateUpgradePrice,
    computeNewPaidUntil,
    getProgramByTitle,
    mapMonthsToSponsorshipEnum,
} from '../utils/studentPaymentUtils.js';

async function extendSubscription(studentEmail, packageId, paidAmount) {
    try {
        const student = await prisma.students.findUnique({ where: { email: studentEmail } });
        const pkg = await prisma.payment_packages.findUnique({ where: { id: parseInt(packageId, 10) } });

        if (!student || !pkg) return null;

        const program = await getProgramByTitle(prisma, student.chosen_program);
        const { durationMonths, payableAmount: expectedAmount } = calculateUpgradePrice(student, program, pkg);
        const newPaidUntil = computeNewPaidUntil(student.paid_until, durationMonths);

        const updated = await prisma.students.update({
            where: { student_id: student.student_id },
            data: {
                paid_until: newPaidUntil,
                sponsorship_package: mapMonthsToSponsorshipEnum(durationMonths),
                funding_status: student.funding_status === 'Full Scholarship' ? 'Full Scholarship' : 'Paid',
                funding_amount: paidAmount ?? expectedAmount,
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
                    program_id: String(packageId || programId),
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
        const { payerPhone, amount, programId, studentEmail, packageId: bodyPackageId } = req.body;
        const packageId = bodyPackageId ?? programId;

        const student = studentEmail
            ? await prisma.students.findUnique({ where: { email: studentEmail } })
            : null;

        const pkg = packageId
            ? await prisma.payment_packages.findUnique({ where: { id: parseInt(packageId, 10) } })
            : null;

        let payableAmount = 0;
        if (student && pkg) {
            const program = await getProgramByTitle(prisma, student.chosen_program);
            payableAmount = calculateUpgradePrice(student, program, pkg).payableAmount;
        } else if (amount !== undefined && amount !== null) {
            payableAmount = parseFloat(amount);
        }

        if (payableAmount > 0 && !payerPhone) {
            return res.status(400).json({ success: false, error: 'Missing mobile number' });
        }

        if (!student || !pkg) {
            return res.status(400).json({ success: false, error: 'Student or package not found' });
        }

        if (payableAmount <= 0 && student && pkg) {
            const updated = await extendSubscription(studentEmail, packageId, 0);
            if (!updated) {
                return res.status(500).json({ success: false, error: 'Could not extend subscription' });
            }
            return res.json({
                success: true,
                transactionId: `SCHOLARSHIP-${Date.now()}`,
                paidUntil: updated.paid_until,
                monthsAdded: pkg.duration_months,
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
                    program_id: String(packageId || programId),
                }
            });

            if (isSuccess) {
                const updated = await extendSubscription(studentEmail, packageId || programId, payableAmount);
                if (!updated) {
                    return res.status(500).json({ success: false, error: 'Payment received but access could not be extended. Contact support.' });
                }
                return res.json({
                    success: true,
                    transactionId,
                    paidUntil: updated.paid_until,
                    monthsAdded: pkg?.duration_months,
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

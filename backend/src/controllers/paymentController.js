import prisma from '../lib/prisma.js';
import { sendWaafiPayment } from '../utils/waafiPayment.js';

// Helper to extend subscription
async function extendSubscription(studentEmail, packageId) {
    try {
        const student = await prisma.students.findUnique({ where: { email: studentEmail } });
        const pkg = await prisma.payment_packages.findUnique({ where: { id: parseInt(packageId) } });

        if (!student || !pkg) return false;

        const durationMonths = parseInt(pkg.duration_months) || 1;
        let currentPaidUntil = student.paid_until ? new Date(student.paid_until) : new Date();
        const baseDate = currentPaidUntil > new Date() ? currentPaidUntil : new Date();
        const newPaidUntil = new Date(baseDate.setMonth(baseDate.getMonth() + durationMonths));

        await prisma.students.update({
            where: { student_id: student.student_id },
            data: {
                paid_until: newPaidUntil,
                funding_status: 'Paid',
                funding_amount: pkg.amount,
                funding_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
            }
        });

        return true;
    } catch (err) {
        console.error('Failed to extend subscription:', err);
        return false;
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
                    program_id: programId
                }
            });
            extendSubscription(student.email, programId);
        }

        res.json({ success: true, transactionId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const createWaafiPayment = async (req, res) => {
    try {
        const { payerPhone, amount, programId, studentEmail } = req.body;
        if (!payerPhone || !amount) return res.status(400).json({ success: false, error: 'Missing fields' });

        const transactionId = `WAAFI-${Date.now()}`;
        const json = await sendWaafiPayment({
            transactionId,
            accountNo: payerPhone,
            amount,
            description: 'BEA Payment'
        });

        const isSuccess = json?.responseCode === '0000' || json?.status === 'SUCCESS';

        if (studentEmail) {
            const student = await prisma.students.findUnique({ where: { email: studentEmail } });
            if (student) {
                await prisma.payments.create({
                    data: {
                        student_id: student.student_id,
                        method: 'waafi',
                        provider_transaction_id: json?.serviceParams?.transactionId || transactionId,
                        amount: parseFloat(amount),
                        status: isSuccess ? 'paid' : 'failed',
                        payer_phone: payerPhone,
                        program_id: programId
                    }
                });

                if (isSuccess) extendSubscription(studentEmail, programId);
            }
        }

        if (!isSuccess) return res.status(400).json({ success: false, error: json?.responseMsg || "Payment failed" });
        res.json({ success: true, transactionId, raw: json });
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

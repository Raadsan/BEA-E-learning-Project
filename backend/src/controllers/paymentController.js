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
    resolveProgramForPackage,
    mapMonthsToSponsorshipEnum,
} from '../utils/studentPaymentUtils.js';

async function extendSubscription(studentEmail, packageId, paidAmount) {
    try {
        const student = await prisma.students.findUnique({ where: { email: studentEmail } });
        const pkg = await prisma.payment_packages.findUnique({ where: { id: parseInt(packageId, 10) } });

        if (!student || !pkg) return null;

        const program = await resolveProgramForPackage(prisma, student, pkg);
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
            const program = await resolveProgramForPackage(prisma, student, pkg);
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
        const { search, method, status, from, to, student_id } = req.query;
        const payments = await prisma.payments.findMany({
            where: student_id ? { student_id: String(student_id) } : undefined,
            orderBy: { created_at: 'desc' }
        });

        const populatedPayments = await Promise.all(payments.map(async (payment) => {
            let student = null;
            if (payment.student_id) {
                student = await prisma.students.findUnique({
                    where: { student_id: payment.student_id }
                });
            }

            let package_name = null;
            if (payment.program_id && !Number.isNaN(parseInt(payment.program_id, 10))) {
                const pkg = await prisma.payment_packages.findUnique({
                    where: { id: parseInt(payment.program_id, 10) },
                });
                package_name = pkg?.package_name || null;
            }

            const row = {
                ...payment,
                amount: payment.amount != null ? Number(payment.amount) : 0,
                student_name: student?.full_name || null,
                program_name: student?.chosen_program || package_name || payment.program_id,
                package_name,
                payment_method: payment.method,
                payment_date: payment.created_at,
                transaction_id: payment.provider_transaction_id,
            };

            return row;
        }));

        let filtered = populatedPayments;
        if (method) {
            filtered = filtered.filter((p) => String(p.method || '').toLowerCase().includes(String(method).toLowerCase()));
        }
        if (status) {
            filtered = filtered.filter((p) => String(p.status || '').toLowerCase() === String(status).toLowerCase());
        }
        if (from) {
            const fromDate = new Date(from);
            filtered = filtered.filter((p) => p.created_at && new Date(p.created_at) >= fromDate);
        }
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((p) => p.created_at && new Date(p.created_at) <= toDate);
        }
        if (search) {
            const q = String(search).toLowerCase();
            filtered = filtered.filter((p) => {
                const blob = [
                    p.student_name,
                    p.student_id,
                    p.method,
                    p.payment_method,
                    p.status,
                    p.program_name,
                    p.package_name,
                    p.provider_transaction_id,
                    p.transaction_id,
                    p.payer_phone,
                    p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
                ].join(' ').toLowerCase();
                return blob.includes(q);
            });
        }

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getExpiredPayments = async (req, res) => {
    try {
        const now = new Date();
        const students = await prisma.students.findMany({
            orderBy: { full_name: 'asc' },
            select: {
                student_id: true,
                full_name: true,
                email: true,
                phone: true,
                chosen_program: true,
                chosen_subprogram: true,
                funding_status: true,
                paid_until: true,
                approval_status: true,
            },
        });

        const studentIds = students.map((student) => student.student_id);
        const payments = studentIds.length > 0
            ? await prisma.payments.findMany({
                where: { student_id: { in: studentIds } },
                orderBy: { created_at: 'desc' },
            })
            : [];

        const latestPaymentByStudent = new Map();
        for (const payment of payments) {
            if (payment.student_id && !latestPaymentByStudent.has(payment.student_id)) {
                latestPaymentByStudent.set(payment.student_id, payment);
            }
        }

        const accessStudents = students.map((student) => {
            const latestPayment = latestPaymentByStudent.get(student.student_id);
            const expiryDate = student.paid_until ? new Date(student.paid_until) : null;
            const remainingSeconds = expiryDate
                ? Math.trunc((expiryDate.getTime() - now.getTime()) / 1000)
                : null;
            const accessStatus = remainingSeconds == null
                ? 'no_expiry'
                : remainingSeconds >= 0 ? 'active' : 'expired';

            return {
                ...student,
                funding_status: String(student.funding_status || '').replaceAll('_', ' '),
                expiry_date: student.paid_until,
                access_status: accessStatus,
                remaining_seconds: remainingSeconds,
                last_payment_amount: latestPayment?.amount != null ? Number(latestPayment.amount) : null,
                last_payment_date: latestPayment?.created_at || null,
                payment_method: latestPayment?.method || null,
                payment_status: latestPayment?.status || null,
            };
        });

        res.json({ success: true, accessStudents });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const extendExpiredPayment = async (req, res) => {
    try {
        const studentId = String(req.params.studentId || '').trim();
        const quantity = Number(req.body.quantity);
        const unit = String(req.body.unit || '').toLowerCase();
        const allowedUnits = ['hours', 'days', 'weeks', 'months'];

        if (!studentId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000 || !allowedUnits.includes(unit)) {
            return res.status(400).json({
                success: false,
                error: 'Provide a whole quantity from 1 to 10000 and a valid unit: hours, days, weeks, or months.',
            });
        }

        const student = await prisma.students.findUnique({ where: { student_id: studentId } });
        if (!student) return res.status(404).json({ success: false, error: 'Student not found.' });

        const now = new Date();
        const currentExpiry = student.paid_until ? new Date(student.paid_until) : null;
        const newExpiry = currentExpiry && currentExpiry > now ? new Date(currentExpiry) : new Date(now);

        if (unit === 'hours') newExpiry.setHours(newExpiry.getHours() + quantity);
        if (unit === 'days') newExpiry.setDate(newExpiry.getDate() + quantity);
        if (unit === 'weeks') newExpiry.setDate(newExpiry.getDate() + (quantity * 7));
        if (unit === 'months') newExpiry.setMonth(newExpiry.getMonth() + quantity);

        const updated = await prisma.students.update({
            where: { student_id: studentId },
            data: { paid_until: newExpiry },
            select: { student_id: true, full_name: true, paid_until: true },
        });

        res.json({ success: true, student: updated, message: `Access extended by ${quantity} ${unit}.` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getStudentPayments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payments = await prisma.payments.findMany({
            where: { student_id: studentId },
            orderBy: { created_at: 'desc' }
        });

        const enriched = await Promise.all(payments.map(async (payment) => {
            let package_name = null;
            if (payment.program_id && !Number.isNaN(parseInt(payment.program_id, 10))) {
                const pkg = await prisma.payment_packages.findUnique({
                    where: { id: parseInt(payment.program_id, 10) },
                });
                package_name = pkg?.package_name || null;
            }
            return {
                ...payment,
                amount: payment.amount != null ? Number(payment.amount) : 0,
                package_name,
                program_name: package_name || payment.program_id,
                payment_method: payment.method,
                transaction_id: payment.provider_transaction_id,
            };
        }));

        res.json({ success: true, payments: enriched });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

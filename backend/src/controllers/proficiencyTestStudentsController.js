import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { validateEmailRobust } from '../utils/emailValidator.js';
import {
    sendWaafiPayment,
    isWaafiPaymentSuccess,
    getWaafiErrorMessage
} from '../utils/waafiPayment.js';

export const registerCandidate = async (req, res) => {
    try {
        const { password, payment, email, ...rest } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailStr = email.trim().toLowerCase();
        
        // Deep Email Validation
        const emailValidationResult = await validateEmailRobust(emailStr);

        if (!emailValidationResult.valid) {
            return res.status(400).json({ error: emailValidationResult.message || "Invalid email address. Please provide a real and working email." });
        }

        const existing = await prisma.ProficiencyTestStudents.findUnique({
            where: { email: emailStr }
        });
        if (existing) {
            return res.status(400).json({ error: "Email already registered for Proficiency Test" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let paymentStatus = 'unpaid';

        if (payment?.method === 'mwallet_account' && parseFloat(payment.amount) > 0) {
            const waafiResponse = await sendWaafiPayment({
                transactionId: `PROF-${Date.now()}`,
                accountNo: payment.payerPhone,
                amount: parseFloat(payment.amount),
                description: `Proficiency Test Registration: ${rest.first_name} ${rest.last_name}`
            });
            if (!isWaafiPaymentSuccess(waafiResponse)) {
                return res.status(400).json({ error: getWaafiErrorMessage(waafiResponse) });
            }
            paymentStatus = 'paid';
        } else if (payment?.method === 'bank') {
            paymentStatus = 'unpaid';
        } else {
            paymentStatus = 'paid';
        }

        const candidate = await prisma.ProficiencyTestStudents.create({
            data: {
                ...rest,
                email: emailStr,
                password: hashedPassword,
                payment_status: paymentStatus,
                expiry_date: new Date(Date.now() + 1440 * 60000)
            }
        });

        res.status(201).json({
            message: 'Registration successful',
            candidate: { student_id: candidate.student_id, email: candidate.email, first_name: candidate.first_name, last_name: candidate.last_name }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateCandidate = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.password) data.password = await bcrypt.hash(data.password, 10);
        const updated = await prisma.ProficiencyTestStudents.update({
            where: { student_id: req.params.id },
            data
        });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getCandidates = async (req, res) => {
    try {
        const candidates = await prisma.ProficiencyTestStudents.findMany({ orderBy: { registration_date: 'desc' } });
        res.json(candidates);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const extendCandidateDeadline = async (req, res) => {
    try {
        const { durationMinutes = 1440 } = req.body;
        await prisma.ProficiencyTestStudents.update({
            where: { student_id: req.params.id },
            data: { expiry_date: new Date(Date.now() + durationMinutes * 60000), is_extended: true, reminder_sent: false }
        });
        res.json({ message: 'Deadline extended' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateCandidateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
        await prisma.ProficiencyTestStudents.update({
            where: { student_id: req.params.id },
            data: { status }
        });
        res.json({ message: `Candidate ${status}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteCandidate = async (req, res) => {
    try {
        await prisma.ProficiencyTestStudents.delete({ where: { student_id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

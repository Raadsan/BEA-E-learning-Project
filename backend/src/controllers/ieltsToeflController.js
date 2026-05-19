import prisma from '../lib/prisma.js';
import { validateEmailRobust } from '../utils/emailValidator.js';
import bcrypt from "bcryptjs";
import { generateStudentId } from "../utils/idGenerator.js";
import { sendWaafiPayment } from "../utils/waafiPayment.js";

export const getAllIeltsStudents = async (req, res) => {
    try {
        const students = await prisma.IELTSTOEFL.findMany({
            orderBy: { registration_date: 'desc' }
        });
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createIeltsStudent = async (req, res) => {
    try {
        const { email, chosen_program, password, payment, ...rest } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailStr = email.trim().toLowerCase();
        
        // Deep Email Validation
        const emailValidationResult = await validateEmailRobust(emailStr);

        if (!emailValidationResult.valid) {
            return res.status(400).json({ error: emailValidationResult.message || "Invalid email address. Please provide a real and working email." });
        }

        const existing = await prisma.IELTSTOEFL.findFirst({
            where: { email: emailStr, chosen_program }
        });
        if (existing) return res.status(400).json({ error: "Already registered for this program" });

        const student_id = await generateStudentId('IELTSTOEFL', chosen_program);
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const data = {
            ...rest,
            student_id,
            email: emailStr,
            chosen_program,
            password: hashedPassword,
            status: 'Pending',
            expiry_date: new Date(Date.now() + 1440 * 60000)
        };

        if (payment && payment.method === 'mwallet_account') {
            const waafiResponse = await sendWaafiPayment({
                transactionId: `WAAFI-${Date.now()}`,
                accountNo: payment.payerPhone,
                amount: parseFloat(payment.amount),
                description: `IELTS Registration`
            });
            if (waafiResponse?.responseCode === '0000') {
                data.payment_method = 'mwallet_account';
                data.transaction_id = waafiResponse.serviceParams?.transactionId;
                data.payment_amount = parseFloat(payment.amount);
                data.payer_phone = payment.payerPhone;
            } else {
                return res.status(400).json({ error: "Payment failed" });
            }
        }

        const student = await prisma.IELTSTOEFL.create({ data });
        res.status(201).json({ success: true, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getIeltsStudent = async (req, res) => {
    try {
        const student = await prisma.IELTSTOEFL.findUnique({
            where: { student_id: req.params.id }
        });
        if (!student) return res.status(404).json({ error: "Not found" });
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateIeltsStudent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        const updated = await prisma.IELTSTOEFL.update({
            where: { student_id: req.params.id },
            data
        });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteIeltsStudent = async (req, res) => {
    try {
        await prisma.IELTSTOEFL.delete({ where: { student_id: req.params.id } });
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

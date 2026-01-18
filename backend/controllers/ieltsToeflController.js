import * as ieltsToeflModel from "../models/ieltsToeflModel.js";
import bcrypt from "bcryptjs";
import { validatePassword, passwordPolicyMessage } from "../utils/passwordValidator.js";
import { sendWaafiPayment } from "../utils/waafiPayment.js";
import { createPayment } from "../models/paymentModel.js";

export const getAllIeltsStudents = async (req, res) => {
    try {
        const students = await ieltsToeflModel.getAllStudents();
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error("Error fetching IELTS/TOEFL students:", error);
        res.status(500).json({ success: false, error: "Failed to fetch students" });
    }
};

export const createIeltsStudent = async (req, res) => {
    try {
        const { password, payment } = req.body;

        // 1. Validate Password
        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ success: false, error: passwordPolicyMessage });
            }
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(password, salt);
        }

        // 2. Process Payment if present
        let transactionId = null;
        let paymentStatus = 'Pending';
        let waafiRawResponse = null;

        if (payment && payment.method === 'mwallet_account') {
            const waafiResponse = await sendWaafiPayment({
                transactionId: `WAAFI-${Date.now()}`,
                accountNo: payment.payerPhone,
                amount: payment.amount,
                description: `IELTS/TOEFL Registration: ${req.body.chosen_program}`
            });

            console.log("Waafi Response for IELTS:", waafiResponse);
            waafiRawResponse = waafiResponse;

            const respCode = waafiResponse?.responseCode || waafiResponse?.code;
            const success = (respCode === '0000' || respCode === '0' || respCode === '2001') ||
                (waafiResponse?.serviceParams?.status === 'SUCCESS');

            if (!success) {
                return res.status(400).json({
                    success: false,
                    error: waafiResponse?.responseMsg || waafiResponse?.message || "Payment failed"
                });
            }

            transactionId = waafiResponse?.serviceParams?.transactionId || `WAAFI-${Date.now()}`;
            paymentStatus = 'Paid';

            // Update req.body with payment details
            req.body.payment_method = 'mwallet_account';
            req.body.transaction_id = transactionId;
            req.body.payment_amount = payment.amount;
            req.body.payer_phone = payment.payerPhone;
            req.body.status = 'Pending'; // Keep status as Pending for Admin Approval even if Paid
        } else if (payment && payment.method === 'bank') {
            req.body.payment_method = 'bank';
            req.body.payment_amount = payment.amount;
            req.body.status = 'Pending';
        }

        // 3. Create Student
        const student = await ieltsToeflModel.createStudent(req.body);

        // 4. Sync to Payments table if it was a successful mobile payment
        if (student && paymentStatus === 'Paid' && transactionId) {
            try {
                await createPayment({
                    ielts_student_id: student.id,
                    method: 'mwallet_account',
                    provider_transaction_id: transactionId,
                    amount: req.body.payment_amount,
                    status: 'paid',
                    payer_phone: req.body.payer_phone,
                    raw_response: waafiRawResponse,
                    program_id: req.body.chosen_program
                });
                console.log(`✅ Payment synced to payments table for IELTS student ${student.student_id}`);
            } catch (err) {
                console.error("❌ Failed to sync payment to payments table:", err);
                // We don't fail the whole request since the student is already created
            }
        } else if (student && req.body.payment_method === 'bank') {
            // Record pending bank transfer in payments table too
            try {
                await createPayment({
                    ielts_student_id: student.id,
                    method: 'bank',
                    amount: req.body.payment_amount,
                    status: 'pending',
                    program_id: req.body.chosen_program
                });
            } catch (err) {
                console.error("❌ Failed to record bank payment in payments table:", err);
            }
        }

        res.status(201).json({ success: true, student });
    } catch (error) {
        console.error("Error creating IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to create student" });
    }
};

export const getIeltsStudent = async (req, res) => {
    try {
        const student = await ieltsToeflModel.getStudentById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, student });
    } catch (error) {
        console.error("Error fetching IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to fetch student" });
    }
};

export const updateIeltsStudent = async (req, res) => {
    try {
        const { password } = req.body;
        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ success: false, error: passwordPolicyMessage });
            }
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(password, salt);
        } else {
            delete req.body.password;
        }
        const affectedRows = await ieltsToeflModel.updateStudent(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found or no changes made" });
        }
        const updatedStudent = await ieltsToeflModel.getStudentById(req.params.id);
        res.status(200).json({ success: true, student: updatedStudent });
    } catch (error) {
        console.error("Error updating IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to update student" });
    }
};

export const rejectIeltsStudent = async (req, res) => {
    try {
        const affectedRows = await ieltsToeflModel.rejectStudent(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: "Student rejected and class unassigned successfully" });
    } catch (error) {
        console.error("Error rejecting IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to reject student" });
    }
};

export const approveIeltsStudent = async (req, res) => {
    try {
        const affectedRows = await ieltsToeflModel.approveStudent(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: "Student approved successfully" });
    } catch (error) {
        console.error("Error approving IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to approve student" });
    }
};

export const deleteIeltsStudent = async (req, res) => {
    try {
        const affectedRows = await ieltsToeflModel.deleteStudent(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to delete student" });
    }
};

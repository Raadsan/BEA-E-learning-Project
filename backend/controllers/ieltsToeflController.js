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
        const { email, chosen_program, password, payment } = req.body;

        // 0. Check for existing registration for this program
        const existing = await ieltsToeflModel.getAllStudents();
        const alreadyRegistered = existing.find(s => s.email === email && s.chosen_program === chosen_program);

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                error: `You are already registered for the ${chosen_program} program.`
            });
        }

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

        const paymentAmount = payment?.amount ? parseFloat(payment.amount) : 0;

        if (payment && payment.method === 'mwallet_account' && paymentAmount > 0) {
            const waafiResponse = await sendWaafiPayment({
                transactionId: `WAAFI-${Date.now()}`,
                accountNo: payment.payerPhone,
                amount: paymentAmount,
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
            req.body.payment_amount = paymentAmount;
            req.body.payer_phone = payment.payerPhone;
            req.body.status = 'Pending'; // Keep status as Pending for Admin Approval even if Paid
        } else if (payment && paymentAmount === 0) {
            // Free registration
            paymentStatus = 'Paid';
            transactionId = `FREE-${Date.now()}`;
            req.body.payment_method = payment.method || 'free';
            req.body.transaction_id = transactionId;
            req.body.payment_amount = 0;
            req.body.status = 'Pending';
        } else if (payment && payment.method === 'bank') {
            req.body.payment_method = 'bank';
            req.body.payment_amount = paymentAmount;
            req.body.status = 'Pending';
        }

        // 3. Create Student
        const student = await ieltsToeflModel.createStudent(req.body);

        // 4. Sync to Payments table if it was a successful mobile payment
        if (student && paymentStatus === 'Paid' && transactionId) {
            try {
                await createPayment({
                    ielts_student_id: student.student_id,
                    method: 'waafi',
                    provider_transaction_id: transactionId,
                    amount: req.body.payment_amount,
                    status: 'paid',
                    payer_phone: req.body.payer_phone,
                    raw_response: { note: 'Registration Fee', ...waafiRawResponse },
                    program_id: 'Proficiency Test'
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
                    ielts_student_id: student.student_id,
                    method: 'bank',
                    amount: req.body.payment_amount,
                    status: 'pending',
                    program_id: 'Proficiency Test',
                    raw_response: { note: 'Registration Fee (Bank)' }
                });
            } catch (err) {
                console.error("❌ Failed to record bank payment in payments table:", err);
            }
        } else if (student && req.body.funding_status === 'Paid') {
            // Record ADMIN created manual payment
            try {
                await createPayment({
                    ielts_student_id: student.student_id,
                    method: 'cash', // Default to cash/manual for admin entry
                    amount: req.body.funding_amount,
                    status: 'paid',
                    month_paid_for: req.body.funding_month,
                    program_id: 'Proficiency Test'
                });
                console.log(`✅ Admin manual payment synced for IELTS student ${student.student_id}`);
            } catch (err) {
                console.error("❌ Failed to record admin manual payment:", err);
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

        // Define valid columns for IELTSTOEFL table to prevent "Unknown column" errors
        const validColumns = [
            'first_name', 'last_name', 'email', 'phone', 'age', 'sex',
            'residency_country', 'residency_city', 'exam_type', 'verification_method',
            'certificate_institution', 'certificate_date', 'certificate_document',
            'exam_booking_date', 'exam_booking_time', 'status', 'password',
            'payment_method', 'transaction_id', 'payment_amount', 'payer_phone', 'class_id',
            'funding_status', 'funding_amount', 'funding_month', 'paid_until', 'chosen_program',
            'expiry_date', 'date_of_birth', 'place_of_birth'
        ];

        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (validColumns.includes(key)) {
                // Convert empty strings to null for optional database columns (dates, ints, etc)
                updateData[key] = (req.body[key] === "" || req.body[key] === undefined) ? null : req.body[key];
            }
        });

        const affectedRows = await ieltsToeflModel.updateStudent(req.params.id, updateData);
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

export const extendIeltsDeadline = async (req, res) => {
    try {
        const { durationMinutes } = req.body;
        const affectedRows = await ieltsToeflModel.extendDeadline(req.params.id, durationMinutes || 1440);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: `Deadline extended by ${durationMinutes || 1440} minutes successfully` });
    } catch (error) {
        console.error("Error extending IELTS/TOEFL deadline:", error);
        res.status(500).json({ success: false, error: "Failed to extend deadline" });
    }
};

export const assignIeltsClass = async (req, res) => {
    try {
        const { classId } = req.body;
        if (!classId) {
            return res.status(400).json({ success: false, error: "Class ID is required" });
        }
        const affectedRows = await ieltsToeflModel.assignToClass(req.params.id, classId);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: "Student assigned to class successfully" });
    } catch (error) {
        console.error("Error assigning class to IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to assign student to class" });
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

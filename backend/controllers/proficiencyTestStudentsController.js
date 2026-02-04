import * as ProficiencyModel from "../models/proficiencyTestStudentsModel.js";
import { createPayment } from "../models/paymentModel.js";
import { sendWaafiPayment } from "../utils/waafiPayment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register new "Test Only" candidate
export const registerCandidate = async (req, res) => {
    try {
        const { password, payment } = req.body;

        // 1. Password Processing
        const hashedPassword = await bcrypt.hash(password, 10);
        const candidateData = {
            ...req.body,
            password: hashedPassword
        };

        // 2. Waafi Payment Processing
        let transactionId = null;
        let paymentStatus = 'unpaid';
        let waafiRawResponse = null;

        const paymentAmount = payment?.amount ? parseFloat(payment.amount) : 0;

        if (payment && payment.method === 'mwallet_account' && paymentAmount > 0) {
            const waafiResponse = await sendWaafiPayment({
                transactionId: `PROF-${Date.now()}`,
                accountNo: payment.payerPhone,
                amount: paymentAmount,
                description: `Proficiency Test Registration: ${req.body.first_name} ${req.body.last_name}`
            });

            console.log("Waafi Response for Proficiency:", waafiResponse);
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
            paymentStatus = 'paid';
            candidateData.payment_status = 'paid';
        } else if (payment && paymentAmount === 0) {
            // Free registration
            paymentStatus = 'paid';
            transactionId = `FREE-${Date.now()}`;
            candidateData.payment_status = 'paid';
        } else if (payment && payment.method === 'bank') {
            candidateData.payment_status = 'Pending';
        }

        // 3. Create Candidate
        const result = await ProficiencyModel.createCandidate(candidateData);

        // 4. Record payment in history if payment info is present
        if (result.student_id) {
            try {
                if (payment && payment.method === 'mwallet_account') {
                    await createPayment({
                        student_id: result.student_id,
                        method: 'waafi',
                        provider_transaction_id: transactionId,
                        amount: payment.amount,
                        currency: 'USD',
                        status: 'paid',
                        payer_phone: payment.payerPhone,
                        program_id: 'Proficiency Test',
                        raw_response: { note: 'Registration Fee', ...waafiRawResponse }
                    });
                    console.log(`✅ Waafi Payment recorded for proficiency: ${result.student_id}`);
                } else if (payment && payment.method === 'bank') {
                    await createPayment({
                        student_id: result.student_id,
                        method: 'bank',
                        amount: payment.amount,
                        currency: 'USD',
                        status: 'pending',
                        program_id: 'Proficiency Test',
                        raw_response: { note: 'Registration Fee (Bank)' }
                    });
                    console.log(`✅ Bank Payment record created for proficiency (Pending): ${result.student_id}`);
                }
            } catch (payErr) {
                console.error("❌ Failed to record registration payment:", payErr);
            }
        }

        res.status(201).json({
            message: "Registration successful",
            candidate: {
                student_id: result.student_id,
                email: result.email,
                first_name: result.first_name,
                last_name: result.last_name
            }
        });
    } catch (error) {
        console.error("Error registering proficiency candidate:", error);
        res.status(500).json({ error: error.message || "Registration failed" });
    }
};

// Update Candidate Info (Admin)
export const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Clean up empty fields if necessary, or just pass updates directly
        // If password is being updated, hash it
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const affected = await ProficiencyModel.updateCandidate(id, updates);

        if (affected === 0) {
            return res.status(404).json({ error: "Candidate not found or no changes made" });
        }

        res.json({ message: "Candidate info updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update candidate info" });
    }
};


// Get all candidates (Admin)
export const getCandidates = async (req, res) => {
    try {
        const candidates = await ProficiencyModel.getAllCandidates();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch candidates" });
    }
};

// Extend access window (Admin)
export const extendCandidateDeadline = async (req, res) => {
    try {
        const { id } = req.params;
        const { durationMinutes } = req.body;
        await ProficiencyModel.extendDeadline(id, durationMinutes);
        res.json({ message: "Access window updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update access window" });
    }
};

// Update status (Admin)
export const updateCandidateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status === 'Approved') {
            await ProficiencyModel.approveCandidate(id);
        } else if (status === 'Rejected') {
            await ProficiencyModel.rejectCandidate(id);
        } else {
            return res.status(400).json({ error: "Invalid status" });
        }

        res.json({ message: `Candidate ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: "Action failed" });
    }
};

// Delete candidate (Admin)
export const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        await ProficiencyModel.deleteCandidate(id);
        res.json({ message: "Candidate deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Deletion failed" });
    }
};

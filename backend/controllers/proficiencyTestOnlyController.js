import * as ProficiencyModel from "../models/proficiencyTestOnlyModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register new "Test Only" candidate
export const registerCandidate = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const candidateData = {
            ...req.body,
            password: hashedPassword
        };

        const result = await ProficiencyModel.createCandidate(candidateData);
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

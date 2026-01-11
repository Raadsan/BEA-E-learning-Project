// controllers/shiftController.js
import * as Shift from "../models/shiftModel.js";

// CREATE SHIFT
export const createShift = async (req, res) => {
    try {
        const { shift_name, session_type, start_time, end_time } = req.body;

        if (!shift_name || !session_type || !start_time || !end_time) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const shift = await Shift.createShift({
            shift_name,
            session_type,
            start_time,
            end_time
        });

        res.status(201).json({ message: "Shift created successfully", shift });
    } catch (err) {
        console.error("❌ Create shift error:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

// GET ALL SHIFTS
export const getShifts = async (req, res) => {
    try {
        const shifts = await Shift.getAllShifts();
        res.json(shifts);
    } catch (err) {
        console.error("❌ Get shifts error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// GET SINGLE SHIFT
export const getShift = async (req, res) => {
    try {
        const { id } = req.params;
        const shift = await Shift.getShiftById(id);

        if (!shift) return res.status(404).json({ error: "Shift not found" });

        res.json(shift);
    } catch (err) {
        console.error("❌ Get shift error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// UPDATE SHIFT
export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Shift.getShiftById(id);

        if (!existing) return res.status(404).json({ error: "Shift not found" });

        await Shift.updateShiftById(id, req.body);

        const updated = await Shift.getShiftById(id);
        res.json({ message: "Shift updated successfully", shift: updated });
    } catch (err) {
        console.error("❌ Update shift error:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

// DELETE SHIFT
export const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Shift.getShiftById(id);

        if (!existing) return res.status(404).json({ error: "Shift not found" });

        await Shift.deleteShiftById(id);
        res.json({ message: "Shift deleted successfully" });
    } catch (err) {
        console.error("❌ Delete shift error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

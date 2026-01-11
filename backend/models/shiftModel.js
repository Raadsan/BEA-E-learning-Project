// models/shiftModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE shift
export const createShift = async ({ shift_name, session_type, start_time, end_time }) => {
    const [result] = await dbp.query(
        "INSERT INTO shifts (shift_name, session_type, start_time, end_time) VALUES (?, ?, ?, ?)",
        [shift_name, session_type, start_time, end_time]
    );

    const [newShift] = await dbp.query("SELECT * FROM shifts WHERE id = ?", [result.insertId]);
    return newShift[0];
};

// GET all shifts
export const getAllShifts = async () => {
    const [rows] = await dbp.query("SELECT * FROM shifts ORDER BY created_at DESC");
    return rows;
};

// GET shift by ID
export const getShiftById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM shifts WHERE id = ?", [id]);
    return rows[0] || null;
};

// UPDATE shift
export const updateShiftById = async (id, { shift_name, session_type, start_time, end_time }) => {
    const updates = [];
    const values = [];

    if (shift_name !== undefined) {
        updates.push("shift_name = ?");
        values.push(shift_name);
    }
    if (session_type !== undefined) {
        updates.push("session_type = ?");
        values.push(session_type);
    }
    if (start_time !== undefined) {
        updates.push("start_time = ?");
        values.push(start_time);
    }
    if (end_time !== undefined) {
        updates.push("end_time = ?");
        values.push(end_time);
    }

    if (updates.length === 0) {
        return 0;
    }

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE shifts SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    return result.affectedRows;
};

// DELETE shift
export const deleteShiftById = async (id) => {
    const [result] = await dbp.query("DELETE FROM shifts WHERE id = ?", [id]);
    return result.affectedRows;
};

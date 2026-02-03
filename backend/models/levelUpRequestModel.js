
import db from "../database/dbconfig.js";

const dbp = db.promise();

export const createLevelUpRequest = async ({
    student_id,
    requested_subprogram_id,
    description
}) => {
    const [result] = await dbp.query(
        `INSERT INTO level_up_requests 
        (student_id, requested_subprogram_id, description) 
        VALUES (?, ?, ?)`,
        [student_id, requested_subprogram_id, description || null]
    );

    const [newRequest] = await dbp.query("SELECT * FROM level_up_requests WHERE id = ?", [result.insertId]);
    return newRequest[0];
};

export const getLevelUpRequests = async () => {
    const [rows] = await dbp.query(
        `SELECT r.*, 
        s.full_name as student_name, 
        s.email as student_email,
        sp.subprogram_name as requested_subprogram_name
        FROM level_up_requests r
        JOIN students s ON r.student_id = s.student_id
        JOIN subprograms sp ON r.requested_subprogram_id = sp.id
        ORDER BY r.created_at DESC`
    );
    return rows;
};

export const getLevelUpRequestsByStudentId = async (studentId) => {
    const [rows] = await dbp.query(
        `SELECT r.*, sp.subprogram_name as requested_subprogram_name
        FROM level_up_requests r
        JOIN subprograms sp ON r.requested_subprogram_id = sp.id
        WHERE r.student_id = ? 
        ORDER BY r.created_at DESC`,
        [studentId]
    );
    return rows;
};

export const updateLevelUpRequestStatus = async (id, status, admin_response) => {
    await dbp.query(
        "UPDATE level_up_requests SET status = ?, admin_response = ? WHERE id = ?",
        [status, admin_response || null, id]
    );
    return true;
};

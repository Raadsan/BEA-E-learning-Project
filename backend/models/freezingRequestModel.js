
import db from "../database/dbconfig.js";

const dbp = db.promise();

export const createFreezingRequest = async ({
    student_id,
    reason,
    start_date,
    end_date,
    description
}) => {
    const [result] = await dbp.query(
        `INSERT INTO freezing_requests 
        (student_id, reason, start_date, end_date, description) 
        VALUES (?, ?, ?, ?, ?)`,
        [student_id, reason, start_date, end_date, description || null]
    );

    const [newRequest] = await dbp.query("SELECT * FROM freezing_requests WHERE id = ?", [result.insertId]);
    return newRequest[0];
};

export const getFreezingRequests = async () => {
    const [rows] = await dbp.query(
        `SELECT r.*, 
        s.full_name as student_name, 
        s.email as student_email
        FROM freezing_requests r
        JOIN students s ON r.student_id = s.student_id
        ORDER BY r.created_at DESC`
    );
    return rows;
};

export const getFreezingRequestsByStudentId = async (studentId) => {
    const [rows] = await dbp.query(
        `SELECT * FROM freezing_requests 
        WHERE student_id = ? 
        ORDER BY created_at DESC`,
        [studentId]
    );
    return rows;
};

export const updateFreezingRequestStatus = async (id, status, admin_response) => {
    await dbp.query(
        "UPDATE freezing_requests SET status = ?, admin_response = ? WHERE id = ?",
        [status, admin_response || null, id]
    );
    return true;
};

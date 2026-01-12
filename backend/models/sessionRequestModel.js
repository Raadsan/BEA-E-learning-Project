import db from "../database/dbconfig.js";

const dbp = db.promise();

export const createSessionRequest = async ({
    student_id,
    current_class_id,
    requested_class_id,
    requested_session_type,
    reason
}) => {
    const [result] = await dbp.query(
        `INSERT INTO session_change_requests 
        (student_id, current_class_id, requested_class_id, requested_session_type, reason) 
        VALUES (?, ?, ?, ?, ?)`,
        [student_id, current_class_id || null, requested_class_id || null, requested_session_type, reason]
    );

    const [newRequest] = await dbp.query("SELECT * FROM session_change_requests WHERE id = ?", [result.insertId]);
    return newRequest[0];
};

export const getSessionRequests = async () => {
    const [rows] = await dbp.query(
        `SELECT r.*, 
        s.full_name as student_name, 
        s.email as student_email,
        c_curr.class_name as current_class_name,
        sh_curr.shift_name as current_shift_name,
        sh_curr.session_type as current_session_type,
        c_req.class_name as requested_class_name,
        sh_req.shift_name as requested_shift_name,
        sh_req.session_type as requested_class_type,
        sub.subprogram_name,
        p.title as program_name
        FROM session_change_requests r
        JOIN students s ON r.student_id = s.student_id
        LEFT JOIN classes c_curr ON r.current_class_id = c_curr.id
        LEFT JOIN shifts sh_curr ON c_curr.shift_id = sh_curr.id
        LEFT JOIN classes c_req ON r.requested_class_id = c_req.id
        LEFT JOIN shifts sh_req ON c_req.shift_id = sh_req.id
        LEFT JOIN subprograms sub ON c_curr.subprogram_id = sub.id
        LEFT JOIN programs p ON sub.program_id = p.id
        ORDER BY r.created_at DESC`
    );
    return rows;
};

export const getRequestsByStudentId = async (studentId) => {
    const [rows] = await dbp.query(
        `SELECT r.*, 
        c_curr.class_name as current_class_name,
        sh_curr.shift_name as current_shift_name,
        sh_curr.session_type as current_session_type,
        c_req.class_name as requested_class_name,
        sh_req.shift_name as requested_shift_name,
        sh_req.session_type as requested_class_type
        FROM session_change_requests r
        LEFT JOIN classes c_curr ON r.current_class_id = c_curr.id
        LEFT JOIN shifts sh_curr ON c_curr.shift_id = sh_curr.id
        LEFT JOIN classes c_req ON r.requested_class_id = c_req.id
        LEFT JOIN shifts sh_req ON c_req.shift_id = sh_req.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC`,
        [studentId]
    );
    return rows;
};

export const updateSessionRequestStatus = async (id, status, admin_response) => {
    await dbp.query(
        "UPDATE session_change_requests SET status = ?, admin_response = ? WHERE id = ?",
        [status, admin_response || null, id]
    );
    // If approved and IDs exist, one might want to trigger class swap logic here or in controller
    return true;
};

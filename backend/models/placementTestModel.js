import db from "../database/dbconfig.js";

const dbp = db.promise();

export const createPlacementTest = async ({
    title,
    description,
    duration_minutes,
    questions,
    status = 'active'
}) => {
    const [result] = await dbp.query(
        `INSERT INTO placement_tests (title, description, duration_minutes, questions, status) 
     VALUES (?, ?, ?, ?, ?)`,
        [title, description, duration_minutes, JSON.stringify(questions), status]
    );
    return { id: result.insertId, title, description, duration_minutes, questions, status };
};

export const getAllPlacementTests = async () => {
    const [rows] = await dbp.query("SELECT * FROM placement_tests ORDER BY created_at DESC");
    return rows;
};

export const getPlacementTestById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM placement_tests WHERE id = ?", [id]);
    return rows[0];
};

export const updatePlacementTest = async (id, data) => {
    const { title, description, duration_minutes, questions, status } = data;
    await dbp.query(
        `UPDATE placement_tests 
     SET title = ?, description = ?, duration_minutes = ?, questions = ?, status = ?
     WHERE id = ?`,
        [title, description, duration_minutes, JSON.stringify(questions), status, id]
    );
    return { id, ...data };
};

export const deletePlacementTest = async (id) => {
    await dbp.query("DELETE FROM placement_tests WHERE id = ?", [id]);
    return { message: "Test deleted successfully" };
};

// --- Results Management ---
export const saveTestResult = async ({
    student_id,
    test_id,
    score,
    total_questions,
    percentage,
    recommended_level,
    answers,
    status = 'completed'
}) => {
    const [result] = await dbp.query(
        `INSERT INTO placement_test_results (student_id, test_id, score, total_questions, percentage, recommended_level, answers, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, test_id, score, total_questions, percentage, recommended_level, JSON.stringify(answers), status]
    );
    return { id: result.insertId, student_id, test_id, score, total_questions, percentage, recommended_level, status };
};

export const getResultsByStudent = async (student_id) => {
    const [rows] = await dbp.query(
        `SELECT r.*, t.title as test_title 
     FROM placement_test_results r 
     JOIN placement_tests t ON r.test_id = t.id 
     WHERE r.student_id = ? 
     ORDER BY r.submitted_at DESC`,
        [student_id]
    );
    return rows;
};

export const getAllResults = async () => {
    const [rows] = await dbp.query(
        `SELECT r.*, t.title as test_title, s.full_name as student_name 
     FROM placement_test_results r 
     JOIN placement_tests t ON r.test_id = t.id 
     JOIN students s ON r.student_id = s.student_id
     ORDER BY r.submitted_at DESC`
    );
    return rows;
};

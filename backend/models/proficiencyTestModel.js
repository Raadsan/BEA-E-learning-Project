import db from "../database/dbconfig.js";

const dbp = db.promise();

export const createProficiencyTest = async ({
    title,
    description,
    duration_minutes,
    questions,
    status = 'active'
}) => {
    const [result] = await dbp.query(
        `INSERT INTO professional_tests (title, description, duration_minutes, questions, status) 
     VALUES (?, ?, ?, ?, ?)`,
        [title, description, duration_minutes, JSON.stringify(questions), status]
    );
    return { id: result.insertId, title, description, duration_minutes, questions, status };
};

export const getAllProficiencyTests = async () => {
    const [rows] = await dbp.query("SELECT * FROM professional_tests ORDER BY created_at DESC");
    return rows;
};

export const getProficiencyTestById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM professional_tests WHERE id = ?", [id]);
    return rows[0];
};

export const updateProficiencyTest = async (id, data) => {
    const { title, description, duration_minutes, questions, status } = data;
    await dbp.query(
        `UPDATE professional_tests 
     SET title = ?, description = ?, duration_minutes = ?, questions = ?, status = ?
     WHERE id = ?`,
        [title, description, duration_minutes, JSON.stringify(questions), status, id]
    );
    return { id, ...data };
};

export const deleteProficiencyTest = async (id) => {
    await dbp.query("DELETE FROM professional_tests WHERE id = ?", [id]);
    return { message: "Test deleted successfully" };
};

// Results Logic

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
        `INSERT INTO proficiency_test_results 
     (student_id, test_id, score, total_points, answers, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [student_id, test_id, score, total_questions, JSON.stringify(answers), status]
    );
    return { id: result.insertId, student_id, test_id, score, total_points: total_questions, status };
};

export const getResultsByStudent = async (studentId) => {
    const [rows] = await dbp.query(
        `SELECT *, 
        (score / NULLIF(total_points, 0) * 100) as percentage 
        FROM proficiency_test_results WHERE student_id = ? ORDER BY submitted_at DESC`,
        [studentId]
    );
    return rows;
};

export const getAllResults = async () => {
    const [rows] = await dbp.query(
        `SELECT r.*, 
         (r.score / NULLIF(r.total_points, 0) * 100) as percentage,
         s.full_name, s.student_id as student_code, t.title as test_title 
         FROM proficiency_test_results r 
         LEFT JOIN students s ON r.student_id = s.student_id 
         LEFT JOIN professional_tests t ON r.test_id = t.id 
         ORDER BY r.submitted_at DESC`
    );
    return rows;
};

export const updateTestResult = async (id, data) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = ?`);
        values.push(value);
    }
    values.push(id);

    await dbp.query(`UPDATE proficiency_test_results SET ${fields.join(', ')} WHERE id = ?`, values);
    return { id, ...data };
};

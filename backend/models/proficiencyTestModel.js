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
        `INSERT INTO proficiency_tests (title, description, duration_minutes, questions, status) 
     VALUES (?, ?, ?, ?, ?)`,
        [title, description, duration_minutes, JSON.stringify(questions), status]
    );
    return { id: result.insertId, title, description, duration_minutes, questions, status };
};

export const getAllProficiencyTests = async () => {
    const [rows] = await dbp.query("SELECT * FROM proficiency_tests ORDER BY created_at DESC");
    return rows;
};

export const getProficiencyTestById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM proficiency_tests WHERE id = ?", [id]);
    return rows[0];
};

export const updateProficiencyTest = async (id, data) => {
    const { title, description, duration_minutes, questions, status } = data;
    await dbp.query(
        `UPDATE proficiency_tests 
     SET title = ?, description = ?, duration_minutes = ?, questions = ?, status = ?
     WHERE id = ?`,
        [title, description, duration_minutes, JSON.stringify(questions), status, id]
    );
    return { id, ...data };
};

export const deleteProficiencyTest = async (id) => {
    await dbp.query("DELETE FROM proficiency_tests WHERE id = ?", [id]);
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

// Helper to enrich results with actual total points and test details
const enrichResults = (rows) => {
    return rows.map(row => {
        let actualTotal = 0;
        try {
            const questions = typeof row.test_questions === 'string'
                ? JSON.parse(row.test_questions)
                : row.test_questions;

            questions?.forEach(q => {
                if (q.type === 'passage') {
                    q.subQuestions?.forEach(sq => {
                        actualTotal += (parseInt(sq.points) || 1);
                    });
                } else {
                    actualTotal += (parseInt(q.points) || 1);
                }
            });
        } catch (e) {
            // Fallback to stored total_points if parsing fails
            actualTotal = row.total_points;
        }

        // Return row with corrected total and percentage
        return {
            ...row,
            total_points: actualTotal,
            percentage: actualTotal > 0 ? (row.score / actualTotal) * 100 : 0,
            test_questions: undefined // Remove from response to reduce payload
        };
    });
};

export const getResultsByStudent = async (studentId) => {
    const [rows] = await dbp.query(
        `SELECT r.*, t.title as test_title, t.questions as test_questions
         FROM proficiency_test_results r 
         LEFT JOIN proficiency_tests t ON r.test_id = t.id
         WHERE r.student_id = ? 
         ORDER BY r.submitted_at DESC`,
        [studentId]
    );
    return enrichResults(rows);
};

export const getAllResults = async () => {
    const [rows] = await dbp.query(
        `SELECT r.*, 
         COALESCE(CONCAT(i.first_name, ' ', i.last_name), s.full_name) as name,
         s.student_id as student_code, t.title as test_title, t.questions as test_questions
         FROM proficiency_test_results r 
         LEFT JOIN students s ON r.student_id = s.student_id 
         LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
         LEFT JOIN proficiency_tests t ON r.test_id = t.id 
         ORDER BY r.submitted_at DESC`
    );

    return enrichResults(rows);
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

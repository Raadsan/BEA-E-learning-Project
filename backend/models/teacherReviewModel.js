import db from "../database/dbconfig.js";

const dbp = db.promise();

// --- Teacher Reviews (Student reviews Teacher) ---

export const createTeacherReview = async (data) => {
    const { student_id, teacher_id, class_id, term_serial, rating, comment, answers } = data;

    // Store answers as a JSON string
    const answersJson = JSON.stringify(answers || []);

    const [result] = await dbp.query(
        `INSERT INTO teacher_reviews (student_id, teacher_id, class_id, term_serial, rating, comment, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [student_id, teacher_id, class_id, term_serial, rating, comment, answersJson]
    );

    return result.insertId;
};

export const getTeacherReviews = async (teacher_id) => {
    const [reviews] = await dbp.query(
        `SELECT tr.*, s.full_name as student_name 
         FROM teacher_reviews tr
         JOIN students s ON tr.student_id = s.student_id
         WHERE tr.teacher_id = ?
         ORDER BY tr.created_at DESC`,
        [teacher_id]
    );

    // No need to fetch from another table, answers are already in 'reviews' (if present)
    return reviews.map(r => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
    }));
};

export const getAllTeacherReviews = async () => {
    const [reviews] = await dbp.query(
        `SELECT tr.*, 
                s.full_name as student_name, 
                t.full_name as teacher_name,
                c.class_name,
                sp.subprogram_name,
                p.title as program_name
         FROM teacher_reviews tr
         JOIN students s ON tr.student_id = s.student_id
         JOIN teachers t ON tr.teacher_id = t.id
         LEFT JOIN classes c ON tr.class_id = c.id
         LEFT JOIN subprograms sp ON c.subprogram_id = sp.id
         LEFT JOIN programs p ON sp.program_id = p.id
         ORDER BY tr.created_at DESC`
    );

    return reviews.map(r => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
    }));
};

export const getTeachersByClassId = async (class_id) => {
    const [rows] = await dbp.query(
        `SELECT DISTINCT t.id as teacher_id, t.full_name
         FROM teachers t
         WHERE t.id IN (
            SELECT teacher_id FROM classes WHERE id = ? AND teacher_id IS NOT NULL
            UNION
            SELECT teacher_id FROM timetables 
            WHERE subprogram_id = (SELECT subprogram_id FROM classes WHERE id = ?) 
            AND teacher_id IS NOT NULL
         )`,
        [class_id, class_id]
    );
    return rows;
};

// --- Teacher Review Questions ---

export const getTeacherQuestions = async () => {
    const [rows] = await dbp.query("SELECT * FROM teacher_review_questions WHERE is_active = TRUE ORDER BY created_at DESC");
    return rows;
};

export const getAllTeacherQuestions = async () => {
    const [rows] = await dbp.query("SELECT * FROM teacher_review_questions ORDER BY created_at DESC");
    return rows;
};

export const createTeacherQuestion = async ({ question_text }) => {
    const [result] = await dbp.query("INSERT INTO teacher_review_questions (question_text) VALUES (?)", [question_text]);
    return result.insertId;
};

export const updateTeacherQuestion = async (id, { question_text, is_active }) => {
    await dbp.query(
        "UPDATE teacher_review_questions SET question_text = ?, is_active = ? WHERE id = ?",
        [question_text, is_active !== undefined ? is_active : true, id]
    );
};

export const deleteTeacherQuestion = async (id) => {
    await dbp.query("DELETE FROM teacher_review_questions WHERE id = ?", [id]);
};

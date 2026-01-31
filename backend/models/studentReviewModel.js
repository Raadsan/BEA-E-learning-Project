import db from "../database/dbconfig.js";

const dbp = db.promise();

// --- Student Reviews (Teacher reviews Student) ---

export const createStudentReview = async (data) => {
    const { teacher_id, student_id, class_id, term_serial, rating, comment, answers } = data;

    // Store answers as a JSON string
    const answersJson = JSON.stringify(answers || []);

    const [result] = await dbp.query(
        `INSERT INTO student_reviews (teacher_id, student_id, class_id, term_serial, rating, comment, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [teacher_id, student_id, class_id, term_serial, rating, comment, answersJson]
    );

    return result.insertId;
};

export const getStudentReviews = async (student_id) => {
    const [reviews] = await dbp.query(
        `SELECT sr.*, t.full_name as teacher_name 
         FROM student_reviews sr
         JOIN teachers t ON sr.teacher_id = t.id
         WHERE sr.student_id = ?
         ORDER BY sr.created_at DESC`,
        [student_id]
    );

    return reviews.map(r => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
    }));
};

export const getAllStudentReviews = async () => {
    const [reviews] = await dbp.query(
        `SELECT sr.*, 
                t.full_name as teacher_name, 
                s.full_name as student_name,
                c.class_name,
                sp.subprogram_name,
                p.title as program_name
         FROM student_reviews sr
         JOIN teachers t ON sr.teacher_id = t.id
         JOIN students s ON sr.student_id = s.student_id
         LEFT JOIN classes c ON sr.class_id = c.id
         LEFT JOIN subprograms sp ON c.subprogram_id = sp.id
         LEFT JOIN programs p ON sp.program_id = p.id
         ORDER BY sr.created_at DESC`
    );

    return reviews.map(r => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
    }));
};

// --- Student Review Questions ---

export const getStudentQuestions = async () => {
    const [rows] = await dbp.query("SELECT * FROM student_review_questions WHERE is_active = TRUE ORDER BY created_at DESC");
    return rows;
};

export const getAllStudentQuestions = async () => {
    const [rows] = await dbp.query("SELECT * FROM student_review_questions ORDER BY created_at DESC");
    return rows;
};

export const createStudentQuestion = async ({ question_text }) => {
    const [result] = await dbp.query("INSERT INTO student_review_questions (question_text) VALUES (?)", [question_text]);
    return result.insertId;
};

export const updateStudentQuestion = async (id, { question_text, is_active }) => {
    await dbp.query(
        "UPDATE student_review_questions SET question_text = ?, is_active = ? WHERE id = ?",
        [question_text, is_active !== undefined ? is_active : true, id]
    );
};

export const deleteStudentQuestion = async (id) => {
    await dbp.query("DELETE FROM student_review_questions WHERE id = ?", [id]);
};

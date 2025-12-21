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

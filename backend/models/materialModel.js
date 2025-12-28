// models/materialModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE material
export const createMaterial = async ({ title, type, program_id, subprogram_id, level, subject, description, url, status }) => {
    const materialStatus = status || 'Active';
    const pId = program_id && program_id !== "" ? program_id : null;
    const spId = subprogram_id && subprogram_id !== "" ? subprogram_id : null;

    const [result] = await dbp.query(
        `INSERT INTO learning_materials (title, type, program_id, subprogram_id, level, subject, description, url, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, type, pId, spId, level, subject, description, url, materialStatus]
    );

    const [newMaterial] = await dbp.query("SELECT * FROM learning_materials WHERE id = ?", [result.insertId]);
    return newMaterial[0];
};

// GET all materials (Admin)
export const getAllMaterials = async () => {
    const [rows] = await dbp.query(
        `SELECT m.*, p.title as program_name, sp.subprogram_name as subprogram_name 
     FROM learning_materials m
     LEFT JOIN programs p ON m.program_id = p.id
     LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
     ORDER BY m.created_at DESC`
    );
    return rows;
};

// GET materials for student by program/subprogram
export const getMaterialsByLevel = async (programId, subprogramId) => {
    // Students should see ONLY materials specifically assigned to their subprogram
    // This ensures each student sees only materials for their level (e.g., A1 - Beginner)

    const [rows] = await dbp.query(
        `SELECT m.*, p.title as program_name, sp.subprogram_name as subprogram_name 
     FROM learning_materials m
     LEFT JOIN programs p ON m.program_id = p.id
     LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
     WHERE m.subprogram_id = ?
     AND m.status = 'Active' 
     ORDER BY m.created_at DESC`,
        [subprogramId]
    );
    return rows;
};

// GET single material
export const getMaterialById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM learning_materials WHERE id = ?", [id]);
    return rows[0] || null;
};

// UPDATE material
export const updateMaterialById = async (id, data) => {
    const updates = [];
    const values = [];

    const allowedFields = ["title", "type", "program_id", "subprogram_id", "level", "subject", "description", "url", "status"];

    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            // Convert empty strings to null for ID fields
            if ((field === 'program_id' || field === 'subprogram_id') && data[field] === "") {
                values.push(null);
            } else {
                values.push(data[field]);
            }
        }
    });

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE learning_materials SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    return result.affectedRows;
};

// DELETE material
export const deleteMaterialById = async (id) => {
    const [result] = await dbp.query("DELETE FROM learning_materials WHERE id = ?", [id]);
    return result.affectedRows;
};

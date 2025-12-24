// models/subprogramModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE subprogram
export const createSubprogram = async ({ subprogram_name, program_id, description, status }) => {
  const programStatus = status || 'active';

  const [result] = await dbp.query(
    "INSERT INTO subprograms (subprogram_name, program_id, description, status) VALUES (?, ?, ?, ?)",
    [subprogram_name, program_id, description, programStatus]
  );

  const [newSubprogram] = await dbp.query("SELECT * FROM subprograms WHERE id = ?", [result.insertId]);
  return newSubprogram[0];
};

// GET all subprograms
export const getAllSubprograms = async () => {
  const [rows] = await dbp.query(
    `SELECT s.*, p.title as program_name 
     FROM subprograms s 
     LEFT JOIN programs p ON s.program_id = p.id 
     ORDER BY s.created_at DESC`
  );
  return rows;
};

// GET subprogram by ID
export const getSubprogramById = async (id) => {
  const [rows] = await dbp.query(
    `SELECT s.*, p.title as program_name 
     FROM subprograms s 
     LEFT JOIN programs p ON s.program_id = p.id 
     WHERE s.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// GET subprograms by program_id
export const getSubprogramsByProgramId = async (program_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM subprograms WHERE program_id = ? ORDER BY subprogram_name",
    [program_id]
  );
  return rows;
};

// GET subprogram by Name and Program ID (Check for duplicates)
export const getSubprogramByNameAndProgramId = async (subprogram_name, program_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM subprograms WHERE subprogram_name = ? AND program_id = ?",
    [subprogram_name, program_id]
  );
  return rows[0] || null;
};

// UPDATE subprogram
export const updateSubprogramById = async (id, { subprogram_name, program_id, description, status }) => {
  const updates = [];
  const values = [];

  if (subprogram_name !== undefined) {
    updates.push("subprogram_name = ?");
    values.push(subprogram_name);
  }
  if (program_id !== undefined) {
    updates.push("program_id = ?");
    values.push(program_id);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE subprograms SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE subprogram
export const deleteSubprogramById = async (id) => {
  const [result] = await dbp.query("DELETE FROM subprograms WHERE id = ?", [id]);
  return result.affectedRows;
};


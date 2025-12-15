// models/programModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();


export const createProgram = async ({ image, video, title, description, status }) => {
  // Default status to 'active' if not provided
  const programStatus = status || 'active';

  const [result] = await dbp.query(
    "INSERT INTO programs (image, video, title, description, status) VALUES (?, ?, ?, ?, ?)",
    [image, video, title, description, programStatus]
  );

  const [newProgram] = await dbp.query("SELECT * FROM programs WHERE id = ?", [result.insertId]);

  return newProgram[0];
};


// GET all programs
export const getAllPrograms = async () => {
  const [rows] = await dbp.query(
    "SELECT * FROM programs ORDER BY created_at DESC"
  );
  return rows;
};

// GET program by ID
export const getProgramById = async (id) => {
  const [rows] = await dbp.query("SELECT * FROM programs WHERE id = ?", [id]);
  return rows[0] || null;
};

// UPDATE program
export const updateProgramById = async (id, { image, video, title, description, status }) => {
  // Build dynamic update query
  const updates = [];
  const values = [];

  if (image !== undefined) {
    updates.push("image = ?");
    values.push(image);
  }
  if (video !== undefined) {
    updates.push("video = ?");
    values.push(video);
  }
  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
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
    `UPDATE programs SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE program
export const deleteProgramById = async (id) => {
  const [result] = await dbp.query("DELETE FROM programs WHERE id = ?", [id]);
  return result.affectedRows;
};

// GET programs by teacher ID
export const getProgramsByTeacherId = async (teacher_id) => {
  const [rows] = await dbp.query(
    `SELECT DISTINCT p.*, s.subprogram_name, s.id as subprogram_id
     FROM programs p
     JOIN subprograms s ON s.program_id = p.id
     JOIN courses c ON c.subprogram_id = s.id
     JOIN classes cl ON cl.course_id = c.id
     WHERE cl.teacher_id = ?
     ORDER BY p.title`,
    [teacher_id]
  );
  // Group by program if needed, or return flat list of subprograms with program info. 
  // Returning flat list is easier for now, frontend can group if needed.
  return rows;
};

// models/programModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE program
export const createProgram = async ({ image, video, title, description }) => {
  const [result] = await dbp.query(
    "INSERT INTO programs (image, video, title, description) VALUES (?, ?, ?, ?)",
    [image, video, title, description]
  );

  return {
    id: result.insertId,
    image,
    video,
    title,
    description
  };
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
  return rows[0];
};

// UPDATE program
export const updateProgramById = async (id, { image, video, title, description }) => {
  const [result] = await dbp.query(
    `
      UPDATE programs 
      SET 
        image = COALESCE(?, image),
        video = COALESCE(?, video),
        title = COALESCE(?, title),
        description = COALESCE(?, description)
      WHERE id = ?
    `,
    [image, video, title, description, id]
  );

  return result.affectedRows;
};

// DELETE program
export const deleteProgramById = async (id) => {
  const [result] = await dbp.query("DELETE FROM programs WHERE id = ?", [id]);
  return result.affectedRows;
};

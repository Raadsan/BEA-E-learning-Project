// models/courseModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE course
export const createCourse = async ({ course_title, subprogram_id, description, duration, price }) => {
  const [result] = await dbp.query(
    "INSERT INTO courses (course_title, subprogram_id, description, duration, price) VALUES (?, ?, ?, ?, ?)",
    [course_title, subprogram_id, description, duration, price]
  );

  const [newCourse] = await dbp.query("SELECT * FROM courses WHERE id = ?", [result.insertId]);
  return newCourse[0];
};

// GET all courses
export const getAllCourses = async () => {
  const [rows] = await dbp.query(
    `SELECT c.*, s.subprogram_name, p.title as program_name 
     FROM courses c 
     LEFT JOIN subprograms s ON c.subprogram_id = s.id 
     LEFT JOIN programs p ON s.program_id = p.id 
     ORDER BY c.created_at DESC`
  );
  return rows;
};

// GET course by ID
export const getCourseById = async (id) => {
  const [rows] = await dbp.query(
    `SELECT c.*, s.subprogram_name, p.title as program_name 
     FROM courses c 
     LEFT JOIN subprograms s ON c.subprogram_id = s.id 
     LEFT JOIN programs p ON s.program_id = p.id 
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// GET courses by subprogram_id
export const getCoursesBySubprogramId = async (subprogram_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM courses WHERE subprogram_id = ? ORDER BY course_title",
    [subprogram_id]
  );
  return rows;
};

// UPDATE course
export const updateCourseById = async (id, { course_title, subprogram_id, description, duration, price }) => {
  const updates = [];
  const values = [];

  if (course_title !== undefined) {
    updates.push("course_title = ?");
    values.push(course_title);
  }
  if (subprogram_id !== undefined) {
    updates.push("subprogram_id = ?");
    values.push(subprogram_id);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (duration !== undefined) {
    updates.push("duration = ?");
    values.push(duration);
  }
  if (price !== undefined) {
    updates.push("price = ?");
    values.push(price);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE courses SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE course
export const deleteCourseById = async (id) => {
  const [result] = await dbp.query("DELETE FROM courses WHERE id = ?", [id]);
  return result.affectedRows;
};


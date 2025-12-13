// models/classModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE class
export const createClass = async ({ class_name, description }) => {
  const [result] = await dbp.query(
    "INSERT INTO classes (class_name, description) VALUES (?, ?)",
    [class_name, description || null]
  );

  const [newClass] = await dbp.query("SELECT * FROM classes WHERE id = ?", [result.insertId]);
  return newClass[0];
};

// GET all classes
export const getAllClasses = async () => {
  const [rows] = await dbp.query(
    `SELECT cl.*, 
            c.course_title, 
            t.full_name as teacher_name,
            s.subprogram_name,
            p.title as program_name
     FROM classes cl 
     LEFT JOIN courses c ON cl.course_id = c.id 
     LEFT JOIN teachers t ON cl.teacher_id = t.id 
     LEFT JOIN subprograms s ON c.subprogram_id = s.id 
     LEFT JOIN programs p ON s.program_id = p.id 
     ORDER BY cl.created_at DESC`
  );
  return rows;
};

// GET class by ID
export const getClassById = async (id) => {
  const [rows] = await dbp.query(
    `SELECT cl.*, 
            c.course_title, 
            t.full_name as teacher_name,
            s.subprogram_name,
            p.title as program_name
     FROM classes cl 
     LEFT JOIN courses c ON cl.course_id = c.id 
     LEFT JOIN teachers t ON cl.teacher_id = t.id 
     LEFT JOIN subprograms s ON c.subprogram_id = s.id 
     LEFT JOIN programs p ON s.program_id = p.id 
     WHERE cl.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// GET classes by course_id
export const getClassesByCourseId = async (course_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM classes WHERE course_id = ? ORDER BY class_name",
    [course_id]
  );
  return rows;
};

// Note: getClassesByTeacherId removed - teacher_id no longer exists in classes table

// UPDATE class
export const updateClassById = async (id, { class_name, course_id, schedule, description, teacher_id }) => {
  const updates = [];
  const values = [];

  if (class_name !== undefined) {
    updates.push("class_name = ?");
    values.push(class_name);
  }
  if (course_id !== undefined) {
    updates.push("course_id = ?");
    values.push(course_id);
  }
  if (schedule !== undefined) {
    updates.push("schedule = ?");
    values.push(schedule);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (teacher_id !== undefined) {
    updates.push("teacher_id = ?");
    values.push(teacher_id || null);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE classes SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE class
export const deleteClassById = async (id) => {
  const [result] = await dbp.query("DELETE FROM classes WHERE id = ?", [id]);
  return result.affectedRows;
};


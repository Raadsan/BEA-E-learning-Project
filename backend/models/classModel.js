// models/classModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE class
export const createClass = async ({ class_name, description, subprogram_id, teacher_id, type }) => {
  const [result] = await dbp.query(
    "INSERT INTO classes (class_name, description, subprogram_id, teacher_id, type) VALUES (?, ?, ?, ?, ?)",
    [class_name, description || null, subprogram_id || null, teacher_id || null, type || 'morning']
  );

  const [newClass] = await dbp.query("SELECT * FROM classes WHERE id = ?", [result.insertId]);
  return newClass[0];
};

// GET all classes
export const getAllClasses = async () => {
  const [rows] = await dbp.query(
    `SELECT cl.*,
            t.full_name as teacher_name,
            s.subprogram_name,
            s.program_id,
            p.title as program_name,
            cs.schedule_date as latest_schedule_date,
            cs.zoom_link as latest_zoom_link
     FROM classes cl
     LEFT JOIN teachers t ON cl.teacher_id = t.id
     LEFT JOIN subprograms s ON cl.subprogram_id = s.id
     LEFT JOIN programs p ON s.program_id = p.id
     LEFT JOIN class_schedules cs ON cl.id = cs.class_id
       AND cs.schedule_date = (
         SELECT MAX(schedule_date) FROM class_schedules
         WHERE class_id = cl.id AND schedule_date >= CURDATE()
       )
     ORDER BY cl.created_at DESC`
  );
  return rows;
};

// GET class by ID
export const getClassById = async (id) => {
  const [rows] = await dbp.query(
    `SELECT cl.*,
            t.full_name as teacher_name,
            s.subprogram_name,
            p.title as program_name,
            cs.schedule_date as latest_schedule_date,
            cs.zoom_link as latest_zoom_link
     FROM classes cl
     LEFT JOIN teachers t ON cl.teacher_id = t.id
     LEFT JOIN subprograms s ON cl.subprogram_id = s.id
     LEFT JOIN programs p ON s.program_id = p.id
     LEFT JOIN class_schedules cs ON cl.id = cs.class_id
       AND cs.schedule_date = (
         SELECT MAX(schedule_date) FROM class_schedules
         WHERE class_id = cl.id AND schedule_date >= CURDATE()
       )
     WHERE cl.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// GET classes by course_id - REMOVED or DEPRECATED?
// Since we are removing courses, this function might be irrelevant, but keeping it empty or throwing error might be safer if called.
// For now, I'll remove it or if it's used somewhere I should find out.
// Assuming it's not used if we remove routes calling it.
export const getClassesByCourseId = async (course_id) => {
  // Returning empty array as course concept is removed
  return [];
};

// GET classes by teacher_id
export const getClassesByTeacherId = async (teacher_id) => {
  const [rows] = await dbp.query(
    `SELECT cl.*, 
            s.subprogram_name,
            p.title as program_name
     FROM classes cl 
     LEFT JOIN subprograms s ON cl.subprogram_id = s.id 
     LEFT JOIN programs p ON s.program_id = p.id 
     WHERE cl.teacher_id = ?
     ORDER BY cl.created_at DESC`,
    [teacher_id]
  );
  return rows;
};

// UPDATE class
export const updateClassById = async (id, { class_name, subprogram_id, description, teacher_id, type }) => {
  const updates = [];
  const values = [];

  if (class_name !== undefined) {
    updates.push("class_name = ?");
    values.push(class_name);
  }
  if (subprogram_id !== undefined) {
    updates.push("subprogram_id = ?");
    values.push(subprogram_id || null);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (teacher_id !== undefined) {
    updates.push("teacher_id = ?");
    values.push(teacher_id || null);
  }
  if (type !== undefined) {
    updates.push("type = ?");
    values.push(type);
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


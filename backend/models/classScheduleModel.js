// models/classScheduleModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE class schedule
export const createClassSchedule = async ({ class_id, schedule_date, zoom_link }) => {
  const [result] = await dbp.query(
    "INSERT INTO class_schedules (class_id, schedule_date, zoom_link) VALUES (?, ?, ?)",
    [class_id, schedule_date, zoom_link || null]
  );

  const [newSchedule] = await dbp.query("SELECT * FROM class_schedules WHERE id = ?", [result.insertId]);
  return newSchedule[0];
};

// GET all schedules for a class
export const getClassSchedules = async (class_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM class_schedules WHERE class_id = ? ORDER BY schedule_date ASC",
    [class_id]
  );
  return rows;
};

// GET latest schedule for a class
export const getLatestClassSchedule = async (class_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM class_schedules WHERE class_id = ? ORDER BY schedule_date DESC LIMIT 1",
    [class_id]
  );
  return rows[0] || null;
};

// UPDATE class schedule
export const updateClassSchedule = async (id, { schedule_date, zoom_link }) => {
  const updates = [];
  const values = [];

  if (schedule_date !== undefined) {
    updates.push("schedule_date = ?");
    values.push(schedule_date);
  }
  if (zoom_link !== undefined) {
    updates.push("zoom_link = ?");
    values.push(zoom_link);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE class_schedules SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE class schedule
export const deleteClassSchedule = async (id) => {
  const [result] = await dbp.query("DELETE FROM class_schedules WHERE id = ?", [id]);
  return result.affectedRows;
};

// GET schedule by ID
export const getScheduleById = async (id) => {
  const [rows] = await dbp.query("SELECT * FROM class_schedules WHERE id = ?", [id]);
  return rows[0] || null;
};

// GET schedules for a student's classes
export const getSchedulesForStudent = async (student_id) => {
  const [rows] = await dbp.query(
    `SELECT cs.*, c.class_name, s.subprogram_name, s.program_id, p.title as program_name
     FROM class_schedules cs
     JOIN classes c ON cs.class_id = c.id
     JOIN attendance a ON a.class_id = c.id
     LEFT JOIN subprograms s ON c.subprogram_id = s.id
     LEFT JOIN programs p ON s.program_id = p.id
     WHERE a.student_id = ?
     AND cs.schedule_date >= CURDATE()
     ORDER BY cs.schedule_date ASC`,
    [student_id]
  );
  return rows;
};
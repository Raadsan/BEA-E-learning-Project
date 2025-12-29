// models/classScheduleModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE class schedule
export const createClassSchedule = async ({ class_id, schedule_date, zoom_link, start_time, end_time, title }) => {
  const [result] = await dbp.query(
    "INSERT INTO class_schedules (class_id, schedule_date, zoom_link, start_time, end_time, title) VALUES (?, ?, ?, ?, ?, ?)",
    [class_id, schedule_date, zoom_link || null, start_time || null, end_time || null, title || null]
  );

  const [newSchedule] = await dbp.query("SELECT * FROM class_schedules WHERE id = ?", [result.insertId]);
  const schedule = newSchedule[0];

  // Format date as string to avoid timezone issues
  if (schedule && schedule.schedule_date) {
    if (schedule.schedule_date instanceof Date) {
      const year = schedule.schedule_date.getFullYear();
      const month = String(schedule.schedule_date.getMonth() + 1).padStart(2, '0');
      const day = String(schedule.schedule_date.getDate()).padStart(2, '0');
      schedule.schedule_date = `${year}-${month}-${day}`;
    } else {
      schedule.schedule_date = String(schedule.schedule_date).split('T')[0].split(' ')[0];
    }
  }

  return schedule;
};

// GET all schedules for a class
export const getClassSchedules = async (class_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM class_schedules WHERE class_id = ? ORDER BY schedule_date ASC",
    [class_id]
  );

  // Format dates as strings to avoid timezone issues
  return rows.map(row => {
    if (row.schedule_date) {
      if (row.schedule_date instanceof Date) {
        const year = row.schedule_date.getFullYear();
        const month = String(row.schedule_date.getMonth() + 1).padStart(2, '0');
        const day = String(row.schedule_date.getDate()).padStart(2, '0');
        row.schedule_date = `${year}-${month}-${day}`;
      } else {
        row.schedule_date = String(row.schedule_date).split('T')[0].split(' ')[0];
      }
    }
    return row;
  });
};

// GET all schedules (Admin view)
export const getAllClassSchedules = async () => {
  const [rows] = await dbp.query(
    `SELECT cs.*, c.class_name, t.full_name as teacher_name 
     FROM class_schedules cs 
     JOIN classes c ON cs.class_id = c.id
     LEFT JOIN teachers t ON c.teacher_id = t.id 
     ORDER BY cs.schedule_date ASC`
  );

  // Format dates as strings to avoid timezone issues
  return rows.map(row => {
    if (row.schedule_date) {
      if (row.schedule_date instanceof Date) {
        const year = row.schedule_date.getFullYear();
        const month = String(row.schedule_date.getMonth() + 1).padStart(2, '0');
        const day = String(row.schedule_date.getDate()).padStart(2, '0');
        row.schedule_date = `${year}-${month}-${day}`;
      } else {
        row.schedule_date = String(row.schedule_date).split('T')[0].split(' ')[0];
      }
    }
    return row;
  });
};

// GET latest schedule for a class
export const getLatestClassSchedule = async (class_id) => {
  const [rows] = await dbp.query(
    "SELECT * FROM class_schedules WHERE class_id = ? ORDER BY schedule_date DESC LIMIT 1",
    [class_id]
  );
  if (rows[0]) {
    const schedule = rows[0];
    if (schedule.schedule_date) {
      if (schedule.schedule_date instanceof Date) {
        const year = schedule.schedule_date.getFullYear();
        const month = String(schedule.schedule_date.getMonth() + 1).padStart(2, '0');
        const day = String(schedule.schedule_date.getDate()).padStart(2, '0');
        schedule.schedule_date = `${year}-${month}-${day}`;
      } else {
        schedule.schedule_date = String(schedule.schedule_date).split('T')[0].split(' ')[0];
      }
    }
    return schedule;
  }
  return null;
};

// UPDATE class schedule
export const updateClassSchedule = async (id, { schedule_date, zoom_link, start_time, end_time, title, class_id }) => {
  const updates = [];
  const values = [];

  if (class_id !== undefined) {
    updates.push("class_id = ?");
    values.push(class_id);
  }
  if (schedule_date !== undefined) {
    updates.push("schedule_date = ?");
    values.push(schedule_date);
  }
  if (zoom_link !== undefined) {
    updates.push("zoom_link = ?");
    values.push(zoom_link);
  }
  if (start_time !== undefined) {
    updates.push("start_time = ?");
    values.push(start_time || null);
  }
  if (end_time !== undefined) {
    updates.push("end_time = ?");
    values.push(end_time || null);
  }
  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title || null);
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
  if (rows[0]) {
    const schedule = rows[0];
    if (schedule.schedule_date) {
      if (schedule.schedule_date instanceof Date) {
        const year = schedule.schedule_date.getFullYear();
        const month = String(schedule.schedule_date.getMonth() + 1).padStart(2, '0');
        const day = String(schedule.schedule_date.getDate()).padStart(2, '0');
        schedule.schedule_date = `${year}-${month}-${day}`;
      } else {
        schedule.schedule_date = String(schedule.schedule_date).split('T')[0].split(' ')[0];
      }
    }
    return schedule;
  }
  return null;
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
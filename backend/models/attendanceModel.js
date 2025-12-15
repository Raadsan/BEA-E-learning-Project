import db from "../database/dbconfig.js";

const dbp = db.promise();

export const markAttendance = async (data) => {
  const { class_id, student_id, date, hour1, hour2 } = data;

  // Upsert: Insert or Update if exists
  const query = `
    INSERT INTO attendance (class_id, student_id, date, hour1, hour2)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    hour1 = VALUES(hour1),
    hour2 = VALUES(hour2)
  `;

  const [result] = await dbp.query(query, [
    class_id,
    student_id,
    date,
    hour1 ? 1 : 0,
    hour2 ? 1 : 0
  ]);

  return result;
};

export const getAttendanceReportByTeacherId = async (teacher_id) => {
  const query = `
      SELECT 
        a.id, 
        a.date, 
        a.hour1, 
        a.hour2,
        s.full_name as student_name,
        c.class_name,
        co.course_title
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN classes c ON a.class_id = c.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.teacher_id = ?
      ORDER BY a.date DESC, c.class_name, s.full_name
    `;
  const [rows] = await dbp.query(query, [teacher_id]);
  return rows;
};

export const getAttendance = async (class_id, date) => {
  const query = `
    SELECT * FROM attendance 
    WHERE class_id = ? AND date = ?
  `;

  const [rows] = await dbp.query(query, [class_id, date]);
  return rows;
};

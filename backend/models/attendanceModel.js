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

export const getAttendanceStats = async (filters) => {
  const { class_id, program_id, startDate, endDate, period } = filters;

  // Base query for attendance counts
  let query = `
    SELECT 
      MIN(DATE(a.date)) as date,
      ${period === 'monthly' ? 'MAX(MONTHNAME(a.date)) as label,' : ''}
      ${period === 'yearly' ? 'MAX(YEAR(a.date)) as label,' : ''}
      ${period === 'weekly' ? 'MAX(CONCAT("Week ", WEEK(a.date))) as label,' : ''}
      ${period === 'daily' ? 'MAX(DAYNAME(a.date)) as label,' : ''}
      COUNT(DISTINCT CASE WHEN (a.hour1 = 1 OR a.hour2 = 1) THEN a.student_id END) as attended
    FROM attendance a
    JOIN classes c ON a.class_id = c.id
    WHERE a.date BETWEEN ? AND ?
  `;

  const params = [startDate, endDate];

  if (class_id) {
    query += ` AND a.class_id = ?`;
    params.push(class_id);
  }

  /*
  if (program_id) {
    query += ` AND c.program_id = ?`;
    params.push(program_id);
  }
  */

  // Grouping
  if (period === 'monthly') {
    query += ` GROUP BY YEAR(a.date), MONTH(a.date)`;
  } else if (period === 'yearly') {
    query += ` GROUP BY YEAR(a.date)`;
  } else if (period === 'weekly') {
    query += ` GROUP BY YEAR(a.date), WEEK(a.date)`;
  } else {
    // Default Daily
    query += ` GROUP BY DATE(a.date)`;
  }

  query += ` ORDER BY date ASC`;

  const [rows] = await dbp.query(query, params);
  return rows;
};

export const getTotalStudents = async (filters) => {
  const { class_id, program_id } = filters;
  let query = `
     SELECT COUNT(s.id) as total
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE 1=1
   `;
  const params = [];

  if (class_id) {
    query += ` AND s.class_id = ?`;
    params.push(class_id);
  }

  /*
  if (program_id) {
    query += ` AND c.program_id = ?`;
    params.push(program_id);
  }
  */

  const [rows] = await dbp.query(query, params);
  return rows[0]?.total || 0;
};

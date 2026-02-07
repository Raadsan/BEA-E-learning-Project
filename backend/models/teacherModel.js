// models/teacherModel.js
import db from "../database/dbconfig.js";
import { generateTeacherId } from "../utils/idGenerator.js";

const dbp = db.promise();

// CREATE teacher
export const createTeacher = async ({
  full_name,
  email,
  phone,
  country,
  city,
  specialization,
  highest_qualification,
  years_experience,
  bio,
  portfolio_link,
  skills,
  hire_date,
  password
}) => {
  const teacher_id = await generateTeacherId();

  const [result] = await dbp.query(
    `INSERT INTO teachers (
      teacher_id, full_name, email, phone, country, city, specialization,
      highest_qualification, years_experience, bio, portfolio_link,
      skills, hire_date, password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      teacher_id,
      full_name,
      email,
      phone,
      country,
      city,
      specialization,
      highest_qualification,
      years_experience,
      bio,
      portfolio_link,
      skills,
      hire_date,
      password
    ]
  );

  const [newTeacher] = await dbp.query("SELECT * FROM teachers WHERE id = ?", [result.insertId]);
  return newTeacher[0];
};

// GET all teachers
export const getAllTeachers = async () => {
  const [rows] = await dbp.query(
    "SELECT id, teacher_id, full_name, email, phone, country, city, specialization, highest_qualification, years_experience, bio, portfolio_link, skills, hire_date, status, profile_picture, created_at, updated_at FROM teachers ORDER BY created_at DESC"
  );
  return rows;
};

// GET teacher by ID
export const getTeacherById = async (id) => {
  const [rows] = await dbp.query(
    "SELECT id, teacher_id, full_name, email, phone, country, city, specialization, highest_qualification, years_experience, bio, portfolio_link, skills, hire_date, status, profile_picture, created_at, updated_at FROM teachers WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

// GET teacher by email
export const getTeacherByEmail = async (email) => {
  const [rows] = await dbp.query("SELECT * FROM teachers WHERE email = ?", [email]);
  return rows[0] || null;
};

// UPDATE teacher
export const updateTeacherById = async (id, {
  full_name,
  email,
  phone,
  country,
  city,
  specialization,
  highest_qualification,
  years_experience,
  bio,
  portfolio_link,
  skills,
  hire_date,
  password,
  status,
  profile_picture
}) => {
  const updates = [];
  const values = [];

  if (full_name !== undefined) {
    updates.push("full_name = ?");
    values.push(full_name);
  }
  if (email !== undefined) {
    updates.push("email = ?");
    values.push(email);
  }
  if (phone !== undefined) {
    updates.push("phone = ?");
    values.push(phone);
  }
  if (country !== undefined) {
    updates.push("country = ?");
    values.push(country);
  }
  if (city !== undefined) {
    updates.push("city = ?");
    values.push(city);
  }
  if (specialization !== undefined) {
    updates.push("specialization = ?");
    values.push(specialization);
  }
  if (highest_qualification !== undefined) {
    updates.push("highest_qualification = ?");
    values.push(highest_qualification);
  }
  if (years_experience !== undefined) {
    updates.push("years_experience = ?");
    values.push(years_experience);
  }
  if (bio !== undefined) {
    updates.push("bio = ?");
    values.push(bio);
  }
  if (portfolio_link !== undefined) {
    updates.push("portfolio_link = ?");
    values.push(portfolio_link);
  }
  if (skills !== undefined) {
    updates.push("skills = ?");
    values.push(skills);
  }
  if (hire_date !== undefined) {
    updates.push("hire_date = ?");
    values.push(hire_date);
  }
  if (password !== undefined) {
    updates.push("password = ?");
    values.push(password);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }
  if (profile_picture !== undefined) {
    updates.push("profile_picture = ?");
    values.push(profile_picture);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE teachers SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE teacher
export const deleteTeacherById = async (id) => {
  const [result] = await dbp.query("DELETE FROM teachers WHERE id = ?", [id]);
  return result.affectedRows;
};

// GET teacher stats
export const getTeacherStatsById = async (id, month, year) => {
  // Use provided month/year or default to current
  const targetDate = (month && year) ? new Date(year, month - 1, 1) : new Date();
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;

  // 0. Get Teacher Info
  const [teacherInfo] = await dbp.query(
    "SELECT full_name FROM teachers WHERE id = ?",
    [id]
  );
  const fullName = teacherInfo[0]?.full_name || "Teacher";

  // 1. Total Classes
  const [classesCount] = await dbp.query(
    "SELECT COUNT(*) as count FROM classes WHERE teacher_id = ?",
    [id]
  );

  // 2. Active Students
  const [studentsCount] = await dbp.query(
    `SELECT COUNT(DISTINCT s.student_id) as count
     FROM students s
     JOIN classes cl ON s.class_id = cl.id
     WHERE cl.teacher_id = ?`,
    [id]
  );

  // 2b. Total Programs
  const [programsCount] = await dbp.query(
    `SELECT COUNT(DISTINCT sp.program_id) as count
     FROM classes cl
     JOIN subprograms sp ON cl.subprogram_id = sp.id
     WHERE cl.teacher_id = ?`,
    [id]
  );

  // 3. Avg Attendance & Totals
  const [attendanceAvg] = await dbp.query(
    `SELECT SUM(a.hour1 + a.hour2) as attended, COUNT(*) * 2 as possible
     FROM attendance a
     JOIN classes cl ON a.class_id = cl.id
     WHERE cl.teacher_id = ? AND MONTH(a.date) = ? AND YEAR(a.date) = ?`,
    [id, targetMonth, targetYear]
  );

  const totalAttended = Number(attendanceAvg[0].attended) || 0;
  const totalPossible = Number(attendanceAvg[0].possible) || 0;

  const avgAttendance = totalPossible > 0
    ? Math.round((totalAttended / totalPossible) * 100)
    : 0;

  // 4. Assignments (Placeholder)
  const assignmentsCount = 0;

  // 5. Weekly Attendance (Filtered by target month)
  const [weeklyStats] = await dbp.query(
    `SELECT DATE(a.date) as date, SUM(a.hour1 + a.hour2) as attended
     FROM attendance a
     JOIN classes cl ON a.class_id = cl.id
     WHERE cl.teacher_id = ? AND MONTH(a.date) = ? AND YEAR(a.date) = ?
     GROUP BY DATE(a.date)
     ORDER BY date ASC`,
    [id, targetMonth, targetYear]
  );

  // For historical months, we'll map into 4-5 weeks or days. 
  // User asked for "Weekly Attendance Trends" for past months.
  // We'll keep the Mon-Sun format but show the aggregate for that month's weeks?
  // Actually, the current chart shows "This Week" vs "Last Week".
  // If a past month is selected, "This Week" could mean "Current month aggregate" and "Last Week" as "Previous month"?
  // Or more logically: Show the 4 weeks of that month.

  const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  const formatData = days.map(day => ({ day, thisWeek: 0, lastWeek: 0 }));

  // Split the month into two halves for "This half" vs "Last half" or just aggregate by day of week
  weeklyStats.forEach(row => {
    const d = new Date(row.date);
    const dayIndex = d.getDay();
    // If it's the second half of the month, put into thisWeek (simulating current focus)
    if (d.getDate() > 15) {
      formatData[dayIndex].thisWeek += Number(row.attended);
    } else {
      formatData[dayIndex].lastWeek += Number(row.attended);
    }
  });

  // 6. Per-Class Attendance for Pie Chart (Filtered by Month)
  const [classAttendanceData] = await dbp.query(
    `SELECT cl.class_name,
            SUM(a.hour1 + a.hour2) as attended,
            COUNT(*) * 2 as possible
     FROM attendance a
     JOIN classes cl ON a.class_id = cl.id
     WHERE cl.teacher_id = ? AND MONTH(a.date) = ? AND YEAR(a.date) = ?
     GROUP BY cl.id, cl.class_name`,
    [id, targetMonth, targetYear]
  );

  return {
    fullName,
    totalClasses: classesCount[0].count,
    activeStudents: studentsCount[0].count,
    totalPrograms: programsCount[0].count,
    avgAttendance,
    totalAttended,
    totalPossible,
    assignmentsCount,
    weeklyAttendance: formatData,
    classAttendanceData: classAttendanceData.map(row => ({
      className: row.class_name,
      attended: Number(row.attended),
      absent: Number(row.possible) - Number(row.attended)
    }))
  };
};

// GET teacher by reset token
export const getTeacherByResetToken = async (token) => {
  const [rows] = await dbp.query(
    "SELECT * FROM teachers WHERE reset_password_token = ? AND reset_password_expires > NOW()",
    [token]
  );
  return rows[0] || null;
};

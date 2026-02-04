import db from "../database/dbconfig.js";
import { generateStudentId } from "../utils/idGenerator.js";

const dbp = db.promise();

// CREATE student
export const createStudent = async ({
  full_name,
  email,
  phone,
  age,
  sex,
  residency_country,
  residency_city,
  chosen_program,
  chosen_subprogram,
  password,
  parent_name,
  parent_email,
  parent_phone,
  parent_relation,
  parent_res_county,
  parent_res_city,
  funding_status,
  sponsorship_package,
  funding_amount,
  funding_month,
  scholarship_percentage,
  sponsor_name,
  paid_until,
  expiry_date,
  reminder_sent,
  admin_expiry_notified,
  date_of_birth,
  place_of_birth
}) => {
  // Generate unique student ID
  const student_id = await generateStudentId('students', chosen_program);

  const [result] = await dbp.query(
    `INSERT INTO students (
      student_id, full_name, email, phone, age, sex, residency_country, residency_city,
      chosen_program, chosen_subprogram, password, parent_name, parent_email, parent_phone,
      parent_relation, parent_res_county, parent_res_city, funding_status, sponsorship_package,
      funding_amount, funding_month, scholarship_percentage, sponsor_name, paid_until,
      expiry_date, reminder_sent, admin_expiry_notified, date_of_birth, place_of_birth
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student_id,
      full_name,
      email,
      phone || null,
      age || null,
      sex || null,
      residency_country || null,
      residency_city || null,
      chosen_program || null,
      chosen_subprogram || null,
      password,
      parent_name || null,
      parent_email || null,
      parent_phone || null,
      parent_relation || null,
      parent_res_county || null,
      parent_res_city || null,
      funding_status || 'Paid',
      sponsorship_package || 'None',
      funding_amount || null,
      funding_month || null,
      scholarship_percentage || null,
      sponsor_name || null,
      paid_until || null,
      expiry_date || null,
      reminder_sent || 0,
      admin_expiry_notified || 0,
      date_of_birth || null,
      place_of_birth || null
    ]
  );

  const [newStudent] = await dbp.query("SELECT * FROM students WHERE student_id = ?", [student_id]);
  return newStudent[0];
};

// GET all students
export const getAllStudents = async () => {
  try {
    const [rows] = await dbp.query(
      `SELECT s.student_id, s.full_name, s.email, s.phone, s.age, s.sex, s.residency_country, s.residency_city, 
       s.chosen_program, s.chosen_subprogram, s.parent_name, s.parent_email, s.parent_phone, 
       s.parent_relation, s.parent_res_county, s.parent_res_city, s.class_id, s.approval_status, 
       s.funding_status, s.sponsorship_package,       s.funding_amount, s.funding_month, s.scholarship_percentage,
       s.sponsor_name,
       s.profile_picture,
        s.paid_until,
        s.expiry_date,
        s.date_of_birth,
        s.place_of_birth,
        s.created_at, s.updated_at, c.class_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       ORDER BY s.created_at DESC`
    );
    return rows;
  } catch (error) {
    console.error("❌ Error in getAllStudents:", error);
    throw error;
  }
};

// GET student by ID
export const getStudentById = async (id) => {
  const [rows] = await dbp.query(
    "SELECT s.student_id, s.full_name, s.email, s.phone, s.age, s.residency_country, s.residency_city, s.chosen_program, s.chosen_subprogram, s.completed_subprograms, s.parent_name, s.parent_email, s.parent_phone, s.parent_relation, s.parent_res_county, s.parent_res_city, s.class_id, s.approval_status, s.sponsor_name, s.profile_picture, s.paid_until, s.expiry_date, s.date_of_birth, s.place_of_birth, s.created_at, s.updated_at, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.student_id = ?",
    [id]
  );
  return rows[0] || null;
};

// GET student by email
export const getStudentByEmail = async (email) => {
  const [rows] = await dbp.query(
    "SELECT * FROM students WHERE email = ?",
    [email]
  );
  return rows[0] || null;
};

// UPDATE student
export const updateStudentById = async (id, {
  full_name,
  email,
  phone,
  age,
  sex,
  residency_country,
  residency_city,
  chosen_program,
  chosen_subprogram,
  password,
  parent_name,
  parent_email,
  parent_phone,
  parent_relation,
  parent_res_county,
  parent_res_city,
  class_id,
  approval_status,
  funding_status,
  sponsorship_package,
  funding_amount,
  funding_month,
  scholarship_percentage,
  sponsor_name,
  profile_picture,
  paid_until,
  expiry_date,
  reminder_sent,
  admin_expiry_notified,
  date_of_birth,
  place_of_birth
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
  if (age !== undefined) {
    updates.push("age = ?");
    values.push(age);
  }
  if (sex !== undefined) {
    updates.push("sex = ?");
    values.push(sex);
  }
  if (residency_country !== undefined) {
    updates.push("residency_country = ?");
    values.push(residency_country);
  }
  if (residency_city !== undefined) {
    updates.push("residency_city = ?");
    values.push(residency_city);
  }
  if (chosen_program !== undefined) {
    updates.push("chosen_program = ?");
    values.push(chosen_program);
  }
  if (chosen_subprogram !== undefined) {
    updates.push("chosen_subprogram = ?");
    values.push(chosen_subprogram);
  }
  if (password !== undefined && password.trim() !== "") {
    updates.push("password = ?");
    values.push(password);
  }
  if (parent_name !== undefined) {
    updates.push("parent_name = ?");
    values.push(parent_name);
  }
  if (parent_email !== undefined) {
    updates.push("parent_email = ?");
    values.push(parent_email);
  }
  if (parent_phone !== undefined) {
    updates.push("parent_phone = ?");
    values.push(parent_phone);
  }
  if (parent_relation !== undefined) {
    updates.push("parent_relation = ?");
    values.push(parent_relation);
  }
  if (parent_res_county !== undefined) {
    updates.push("parent_res_county = ?");
    values.push(parent_res_county);
  }
  if (parent_res_city !== undefined) {
    updates.push("parent_res_city = ?");
    values.push(parent_res_city);
  }
  if (class_id !== undefined) {
    updates.push("class_id = ?");
    values.push(class_id);
  }
  if (approval_status !== undefined) {
    updates.push("approval_status = ?");
    values.push(approval_status);
  }
  if (funding_status !== undefined) {
    updates.push("funding_status = ?");
    values.push(funding_status);
  }
  if (sponsorship_package !== undefined) {
    updates.push("sponsorship_package = ?");
    values.push(sponsorship_package);
  }
  if (funding_amount !== undefined) {
    updates.push("funding_amount = ?");
    values.push(funding_amount);
  }
  if (funding_month !== undefined) {
    updates.push("funding_month = ?");
    values.push(funding_month);
  }
  if (scholarship_percentage !== undefined) {
    updates.push("scholarship_percentage = ?");
    values.push(scholarship_percentage);
  }
  if (sponsor_name !== undefined) {
    updates.push("sponsor_name = ?");
    values.push(sponsor_name);
  }
  if (profile_picture !== undefined) {
    updates.push("profile_picture = ?");
    values.push(profile_picture);
  }
  if (paid_until !== undefined) {
    updates.push("paid_until = ?");
    values.push(paid_until);
  }
  if (expiry_date !== undefined) {
    updates.push("expiry_date = ?");
    values.push(expiry_date);
  }
  if (reminder_sent !== undefined) {
    updates.push("reminder_sent = ?");
    values.push(reminder_sent);
  }
  if (admin_expiry_notified !== undefined) {
    updates.push("admin_expiry_notified = ?");
    values.push(admin_expiry_notified);
  }
  if (date_of_birth !== undefined) {
    updates.push("date_of_birth = ?");
    values.push(date_of_birth);
  }
  if (place_of_birth !== undefined) {
    updates.push("place_of_birth = ?");
    values.push(place_of_birth);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE students SET ${updates.join(", ")} WHERE student_id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE student
export const deleteStudentById = async (id) => {
  const [result] = await dbp.query("DELETE FROM students WHERE student_id = ?", [id]);
  return result.affectedRows;
};

// UPDATE approval status
export const updateApprovalStatus = async (id, status) => {
  const [result] = await dbp.query(
    "UPDATE students SET approval_status = ? WHERE student_id = ?",
    [status, id]
  );
  return result.affectedRows;
};

// REJECT student (sets status to rejected and clears class_id)
export const rejectStudentById = async (id) => {
  const [result] = await dbp.query(
    "UPDATE students SET approval_status = 'rejected', class_id = NULL WHERE student_id = ?",
    [id]
  );
  return result.affectedRows;
};

// GET STUDENT PROGRESS BY TEACHER
export const getStudentProgressByTeacher = async (teacherId) => {
  const [students] = await dbp.query(
    `SELECT 
      s.student_id,
      s.full_name,
      s.email,
      s.phone,
      s.chosen_program,
      s.chosen_subprogram,
      s.sponsor_name,
      s.class_id,
      c.class_name,
      COALESCE(SUM(a.hour1 + a.hour2), 0) as total_attended,
      COALESCE(COUNT(a.id) * 2, 0) as total_possible,
      COALESCE(ROUND((SUM(a.hour1 + a.hour2) / (COUNT(a.id) * 2)) * 100, 2), 0) as progress_percentage,
      MAX(a.date) as last_active
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON s.student_id = a.student_id AND c.id = a.class_id
    WHERE c.teacher_id = ?
    GROUP BY s.student_id, s.full_name, s.email, s.phone, s.chosen_program, s.chosen_subprogram, s.sponsor_name, s.class_id, c.class_name
    ORDER BY s.full_name ASC`,
    [teacherId]
  );

  // Add status based on progress percentage
  return students.map(student => {
    let status = 'Inactive';
    if (student.progress_percentage >= 75) {
      status = 'On Track';
    } else if (student.progress_percentage >= 50) {
      status = 'At Risk';
    }

    return {
      ...student,
      status,
      progress_percentage: student.progress_percentage || 0,
      last_active: student.last_active || null
    };
  });
};

// GET STUDENT PROGRESS BY ID (For individual student dashboard)
export const getStudentProgressById = async (studentId) => {
  const [rows] = await dbp.query(
    `SELECT 
      s.student_id,
      s.full_name,
      s.email,
      s.phone,
      s.chosen_program,
      s.chosen_subprogram,
      s.sponsor_name,
      s.class_id,
      c.class_name,
      SUM(CASE WHEN a.hour1 = 1 THEN 1 ELSE 0 END + CASE WHEN a.hour2 = 1 THEN 1 ELSE 0 END) as total_attended,
      COUNT(DISTINCT a.id) * 2 as total_possible,
      COALESCE(ROUND((SUM(CASE WHEN a.hour1 = 1 THEN 1 ELSE 0 END + CASE WHEN a.hour2 = 1 THEN 1 ELSE 0 END) / (COUNT(DISTINCT a.id) * 2)) * 100, 2), 0) as progress_percentage,
      MAX(a.date) as last_active
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN attendance a ON s.student_id = a.student_id
    LEFT JOIN programs p ON (s.chosen_program = p.id OR s.chosen_program = p.title COLLATE utf8mb4_unicode_ci)
    WHERE s.student_id = ?
    GROUP BY s.student_id, s.full_name, s.email, s.phone, s.chosen_program, s.chosen_subprogram, s.sponsor_name, s.class_id, c.class_name`,
    [studentId]
  );

  if (!rows[0]) return null;
  const student = rows[0];

  let status = 'Inactive';
  if (student.progress_percentage >= 75) status = 'On Track';
  else if (student.progress_percentage >= 50) status = 'At Risk';

  return {
    ...student,
    status,
    progress_percentage: student.progress_percentage || 0,
    last_active: student.last_active || null
  };
};

// UPDATE student program name (Sync function)
export const updateStudentProgramName = async (oldName, newName) => {
  if (!oldName || !newName) return 0;

  const [result] = await dbp.query(
    "UPDATE students SET chosen_program = ? WHERE chosen_program = ?",
    [newName, oldName]
  );
  return result.affectedRows;
};

// GET SEX DISTRIBUTION
export const getSexDistribution = async (program_id, class_id) => {
  let query = `SELECT sex, COUNT(*) as count FROM students`;
  const params = [];
  const conditions = [];

  // Only join if we need to filter by program
  if (program_id) {
    query += ` LEFT JOIN programs p ON (students.chosen_program = p.id OR students.chosen_program = p.title COLLATE utf8mb4_unicode_ci)`;
    conditions.push(`p.id = ?`);
    params.push(program_id);
  }

  if (class_id) {
    conditions.push(`class_id = ?`);
    params.push(class_id);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` GROUP BY sex`;

  const [rows] = await dbp.query(query, params);

  // Calculate percentages
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return rows.map(row => ({
    sex: row.sex || 'Not Specified',
    count: row.count,
    percentage: total > 0 ? Math.round((row.count / total) * 100) : 0
  }));
};

// GET TOP STUDENTS
export const getTopStudents = async (limit = 10, program_id, class_id) => {
  let query = `
    SELECT 
      s.student_id,
      s.full_name,
      s.email,
      s.residency_country,
      s.residency_city,
      s.chosen_program,
      c.class_name,
      p.title as program_name,
      COUNT(DISTINCT a.id) as total_sessions,
      SUM(CASE WHEN a.hour1 = 1 THEN 1 ELSE 0 END + CASE WHEN a.hour2 = 1 THEN 1 ELSE 0 END) as attended_hours,
      COALESCE(ROUND((SUM(CASE WHEN a.hour1 = 1 THEN 1 ELSE 0 END + CASE WHEN a.hour2 = 1 THEN 1 ELSE 0 END) / (COUNT(DISTINCT a.id) * 2)) * 100, 2), 0) as attendance_rate,
      COALESCE(AVG(asub.score), 0) as avg_assignment_score
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN programs p ON (s.chosen_program = p.id OR s.chosen_program = p.title COLLATE utf8mb4_unicode_ci)
    LEFT JOIN attendance a ON s.student_id = a.student_id
    LEFT JOIN assignment_submissions asub ON s.student_id = asub.student_id AND asub.status = 'graded'
    WHERE s.approval_status = 'approved'
  `;

  const params = [];

  if (program_id) {
    query += ` AND p.id = ?`;
    params.push(program_id);
  }

  if (class_id) {
    query += ` AND s.class_id = ?`;
    params.push(class_id);
  }

  query += `
    GROUP BY s.student_id, s.full_name, s.email, s.residency_country, s.residency_city, s.chosen_program, c.class_name, p.title
    HAVING total_sessions > 0
    ORDER BY attendance_rate DESC, avg_assignment_score DESC
    LIMIT ?
  `;

  params.push(parseInt(limit));

  const [rows] = await dbp.query(query, params);
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    attendance_rate: row.attendance_rate || 0,
    avg_assignment_score: row.avg_assignment_score || 0
  }));
};

// GET STUDENT LOCATIONS
export const getStudentLocations = async (program_id, class_id) => {
  const params = [];
  let query = "";

  if (program_id || class_id) {
    // We need to join programs to filter robustly (ID or Title match)
    query = `
        SELECT s.residency_country as country, COUNT(*) as count 
        FROM students s
    `;

    // Add Joins
    if (program_id) {
      query += ` LEFT JOIN programs p ON (s.chosen_program = p.id OR s.chosen_program = p.title COLLATE utf8mb4_unicode_ci)`;
    }

    let whereConditions = ["s.residency_country IS NOT NULL", "s.residency_country != ''"];

    if (program_id) {
      whereConditions.push("p.id = ?");
      params.push(program_id);
    }

    if (class_id) {
      whereConditions.push("s.class_id = ?");
      params.push(class_id);
    }

    query += ` WHERE ${whereConditions.join(" AND ")}`;
    query += ` GROUP BY s.residency_country ORDER BY count DESC`;

  } else {
    // No filters -> Show ALL (Students + IELTS)
    query = `
        SELECT country, COUNT(*) as count FROM (
            SELECT residency_country as country FROM students WHERE residency_country IS NOT NULL AND residency_country != ''
            UNION ALL
            SELECT residency_country as country FROM IELTSTOEFL WHERE residency_country IS NOT NULL AND residency_country != ''
        ) as combined
        GROUP BY country
        ORDER BY count DESC
      `;
  }

  const [rows] = await dbp.query(query, params);
  return rows;
};

// GET STUDENTS BY CLASS ID
// GET STUDENTS BY CLASS ID with Review Status check
export const getStudentsByClassId = async (classId, teacherId = null, termSerial = null) => {
  let query = `
    SELECT s.student_id, s.full_name, s.email, s.phone, s.age, s.sex, s.residency_country, s.residency_city, 
     s.chosen_program, s.chosen_subprogram, s.parent_name, s.parent_email, s.parent_phone, 
     s.parent_relation, s.parent_res_county, s.parent_res_city, s.class_id, s.approval_status, 
     s.funding_status, s.sponsorship_package, s.funding_amount, s.funding_month, s.scholarship_percentage,
     s.sponsor_name,
     s.paid_until,
     s.expiry_date,
     s.created_at, s.updated_at
  `;

  const params = [];

  if (teacherId && termSerial) {
    query += `, (CASE WHEN tr.id IS NOT NULL THEN 1 ELSE 0 END) as is_reviewed `;
  }

  query += ` FROM students s `;

  if (teacherId && termSerial) {
    query += ` LEFT JOIN teacher_reviews tr ON s.student_id = tr.student_id AND tr.teacher_id = ? AND tr.term_serial = ? `;
    params.push(teacherId, termSerial);
  }

  query += ` WHERE s.class_id = ? AND s.approval_status = 'approved' ORDER BY s.full_name ASC`;
  params.push(classId);

  const [rows] = await dbp.query(query, params);
  return rows;
};

// GET historical class for a student and subprogram
export const getHistoricalClass = async (studentId, subprogramId) => {
  const [rows] = await dbp.query(
    `SELECT sch.*, c.class_name 
     FROM student_class_history sch 
     JOIN classes c ON sch.class_id = c.id 
     WHERE sch.student_id = ? AND sch.subprogram_id = ? 
     ORDER BY sch.created_at DESC LIMIT 1`,
    [studentId, subprogramId]
  );
  return rows[0] || null;
};

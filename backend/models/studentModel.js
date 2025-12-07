// models/studentModel.js
import db from "../database/dbconfig.js";
import bcrypt from "bcryptjs";

const dbp = db.promise();

// CREATE student
export const createStudent = async ({
  first_name,
  last_name,
  email,
  phone,
  age,
  gender,
  country,
  city,
  program_id,
  sub_program_id,
  password,
  terms_accepted
}) => {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const is_minor = age < 18;

  const [result] = await dbp.query(
    `INSERT INTO students (
      first_name, last_name, email, phone, age, gender, 
      country, city, program_id, sub_program_id, password, 
      is_minor, terms_accepted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      phone,
      age,
      gender,
      country,
      city,
      program_id,
      sub_program_id || null,
      hashedPassword,
      is_minor,
      terms_accepted
    ]
  );

  return {
    id: result.insertId,
    first_name,
    last_name,
    email,
    phone,
    age,
    gender,
    country,
    city,
    program_id,
    sub_program_id,
    is_minor
  };
};

// CREATE parent (for minor students)
export const createParent = async ({
  student_id,
  parent_first_name,
  parent_last_name,
  parent_email,
  parent_phone,
  relationship
}) => {
  const [result] = await dbp.query(
    `INSERT INTO parents (
      student_id, parent_first_name, parent_last_name, 
      parent_email, parent_phone, relationship
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      student_id,
      parent_first_name,
      parent_last_name,
      parent_email,
      parent_phone,
      relationship
    ]
  );

  return {
    id: result.insertId,
    student_id,
    parent_first_name,
    parent_last_name,
    parent_email,
    parent_phone,
    relationship
  };
};

// GET all students
export const getAllStudents = async () => {
  const [rows] = await dbp.query(`
    SELECT 
      s.*,
      p.title as program_title,
      p.program_type as program_type,
      p.parent_program_id,
      parent_prog.title as parent_program_title,
      par.parent_first_name,
      par.parent_last_name,
      par.parent_email,
      par.parent_phone,
      par.relationship
    FROM students s
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN programs parent_prog ON p.parent_program_id = parent_prog.id
    LEFT JOIN parents par ON s.id = par.student_id
    ORDER BY s.created_at DESC
  `);
  return rows;
};

// GET student by ID
export const getStudentById = async (id) => {
  const [rows] = await dbp.query(`
    SELECT 
      s.*,
      p.title as program_title,
      p.program_type as program_type,
      p.parent_program_id,
      parent_prog.title as parent_program_title,
      par.parent_first_name,
      par.parent_last_name,
      par.parent_email,
      par.parent_phone,
      par.relationship
    FROM students s
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN programs parent_prog ON p.parent_program_id = parent_prog.id
    LEFT JOIN parents par ON s.id = par.student_id
    WHERE s.id = ?
  `, [id]);
  return rows[0];
};

// GET student by email
export const getStudentByEmail = async (email) => {
  const [rows] = await dbp.query("SELECT * FROM students WHERE email = ?", [email]);
  return rows[0];
};

// UPDATE student
export const updateStudentById = async (id, updateData) => {
  const allowedFields = [
    'first_name', 'last_name', 'email', 'phone', 'age', 
    'gender', 'country', 'city', 'program_id', 'sub_program_id'
  ];
  
  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updateData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updates.length === 0) {
    return 0;
  }
  
  values.push(id);
  const [result] = await dbp.query(
    `UPDATE students SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  return result.affectedRows;
};

// DELETE student
export const deleteStudentById = async (id) => {
  const [result] = await dbp.query("DELETE FROM students WHERE id = ?", [id]);
  return result.affectedRows;
};

// GET sub-programs by program_id (from JSON column)
export const getSubProgramsByProgramId = async (program_id) => {
  const [rows] = await dbp.query(
    "SELECT sub_programs FROM programs WHERE id = ?",
    [program_id]
  );
  
  if (rows.length === 0 || !rows[0].sub_programs) {
    return [];
  }

  // Parse JSON and return sub-programs array
  try {
    const subPrograms = typeof rows[0].sub_programs === 'string' 
      ? JSON.parse(rows[0].sub_programs) 
      : rows[0].sub_programs;
    return Array.isArray(subPrograms) ? subPrograms : [];
  } catch (e) {
    console.error("Error parsing sub_programs JSON:", e);
    return [];
  }
};

// GET all programs with their sub-programs
export const getAllProgramsWithSubPrograms = async () => {
  const [rows] = await dbp.query(
    "SELECT id, title, description, sub_programs FROM programs ORDER BY title"
  );
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    sub_programs: row.sub_programs ? (typeof row.sub_programs === 'string' ? JSON.parse(row.sub_programs) : row.sub_programs) : []
  }));
};


// models/studentModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE student
export const createStudent = async ({
  full_name,
  email,
  phone,
  age,
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
  parent_res_city
}) => {
  // Store password as plain text (no encryption)

  const [result] = await dbp.query(
    `INSERT INTO students (
      full_name, email, phone, age, residency_country, residency_city,
      chosen_program, chosen_subprogram, password, parent_name, parent_email, parent_phone,
      parent_relation, parent_res_county, parent_res_city, approval_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full_name,
      email,
      phone || null,
      age || null,
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
      'pending' // Default approval status
    ]
  );

  const [newStudent] = await dbp.query("SELECT * FROM students WHERE id = ?", [result.insertId]);
  return newStudent[0];
};

// GET all students
export const getAllStudents = async () => {
  try {
    const [rows] = await dbp.query(
      "SELECT id, full_name, email, phone, age, residency_country, residency_city, chosen_program, chosen_subprogram, parent_name, parent_email, parent_phone, parent_relation, parent_res_county, parent_res_city, approval_status, created_at, updated_at FROM students ORDER BY created_at DESC"
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
    "SELECT id, full_name, email, phone, age, residency_country, residency_city, chosen_program, chosen_subprogram, parent_name, parent_email, parent_phone, parent_relation, parent_res_county, parent_res_city, approval_status, created_at, updated_at FROM students WHERE id = ?",
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
  approval_status,
  reset_password_token,
  reset_password_expires
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
    // Store password as plain text (no encryption)
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
  if (approval_status !== undefined) {
    updates.push("approval_status = ?");
    values.push(approval_status);
  }
  if (reset_password_token !== undefined) {
    updates.push("reset_password_token = ?");
    values.push(reset_password_token);
  }
  if (reset_password_expires !== undefined) {
    updates.push("reset_password_expires = ?");
    values.push(reset_password_expires);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE students SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE student
export const deleteStudentById = async (id) => {
  const [result] = await dbp.query("DELETE FROM students WHERE id = ?", [id]);
  return result.affectedRows;
};

// UPDATE approval status
export const updateApprovalStatus = async (id, status) => {
  const [result] = await dbp.query(
    "UPDATE students SET approval_status = ? WHERE id = ?",
    [status, id]
  );
  return result.affectedRows;
};

// GET student by reset token
export const getStudentByResetToken = async (token) => {
  const [rows] = await dbp.query(
    "SELECT * FROM students WHERE reset_password_token = ? AND reset_password_expires > NOW()",
    [token]
  );
  return rows[0] || null;
};

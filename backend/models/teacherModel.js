// models/teacherModel.js
import db from "../database/dbconfig.js";

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
  const [result] = await dbp.query(
    `INSERT INTO teachers (
      full_name, email, phone, country, city, specialization,
      highest_qualification, years_experience, bio, portfolio_link,
      skills, hire_date, password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    "SELECT id, full_name, email, phone, country, city, specialization, highest_qualification, years_experience, bio, portfolio_link, skills, hire_date, created_at, updated_at FROM teachers ORDER BY created_at DESC"
  );
  return rows;
};

// GET teacher by ID
export const getTeacherById = async (id) => {
  const [rows] = await dbp.query(
    "SELECT id, full_name, email, phone, country, city, specialization, highest_qualification, years_experience, bio, portfolio_link, skills, hire_date, created_at, updated_at FROM teachers WHERE id = ?",
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

// GET teacher by reset token
export const getTeacherByResetToken = async (token) => {
  const [rows] = await dbp.query(
    "SELECT * FROM teachers WHERE reset_password_token = ? AND reset_password_expires > NOW()",
    [token]
  );
  return rows[0] || null;
};


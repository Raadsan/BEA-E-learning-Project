// models/adminModel.js
import db from "../database/dbconfig.js";
import bcrypt from "bcryptjs";

const dbp = db.promise();

// CREATE admin
export const createAdmin = async ({
  full_name,
  email,
  password,
  role = 'admin'
}) => {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await dbp.query(
    `INSERT INTO admins (full_name, email, password, role) VALUES (?, ?, ?, ?)`,
    [full_name, email, hashedPassword, role]
  );

  const [newAdmin] = await dbp.query("SELECT id, full_name, email, role, created_at, updated_at FROM admins WHERE id = ?", [result.insertId]);
  return newAdmin[0];
};

// GET all admins
export const getAllAdmins = async () => {
  try {
    const [rows] = await dbp.query(
      "SELECT id, full_name, email, role, created_at, updated_at FROM admins ORDER BY created_at DESC"
    );
    return rows;
  } catch (error) {
    console.error("❌ Error in getAllAdmins:", error);
    throw error;
  }
};

// GET admin by ID
export const getAdminById = async (id) => {
  const [rows] = await dbp.query(
    "SELECT id, full_name, email, role, created_at, updated_at FROM admins WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

// GET admin by email
export const getAdminByEmail = async (email) => {
  const [rows] = await dbp.query(
    "SELECT * FROM admins WHERE email = ?",
    [email]
  );
  return rows[0] || null;
};

// UPDATE admin
export const updateAdminById = async (id, {
  full_name,
  email,
  password,
  role
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
  if (role !== undefined) {
    updates.push("role = ?");
    values.push(role);
  }
  if (password !== undefined && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.push("password = ?");
    values.push(hashedPassword);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE admins SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE admin
export const deleteAdminById = async (id) => {
  const [result] = await dbp.query("DELETE FROM admins WHERE id = ?", [id]);
  return result.affectedRows;
};


// models/adminModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE admin
export const createAdmin = async ({
  first_name,
  last_name,
  email,
  phone,
  password,
  role = 'admin',
  status = 'active'
}) => {
  // Store password as plain text (no encryption)
  const adminPassword = password || (email.split('@')[0] + '@123'); // Use provided password or default

  // Split full_name into first_name and last_name
  const nameParts = (full_name || '').trim().split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  const [result] = await dbp.query(
<<<<<<< HEAD
    `INSERT INTO admins (first_name, last_name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone || null, adminPassword, role, status]
  );

  const [newAdmin] = await dbp.query("SELECT id, first_name, last_name, email, phone, role, status, created_at, updated_at FROM admins WHERE id = ?", [result.insertId]);
=======
    `INSERT INTO admins (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, email, hashedPassword, role]
  );

  const [newAdmin] = await dbp.query("SELECT id, first_name, last_name, email, role, created_at, updated_at FROM admins WHERE id = ?", [result.insertId]);
  if (newAdmin[0]) {
    newAdmin[0].full_name = `${newAdmin[0].first_name || ''} ${newAdmin[0].last_name || ''}`.trim();
  }
>>>>>>> 264c997f296322ec81499e01cc49e66f3b5ae4fb
  return newAdmin[0];
};

// GET all admins
export const getAllAdmins = async () => {
  try {
    const [rows] = await dbp.query(
<<<<<<< HEAD
      "SELECT id, first_name, last_name, email, phone, password, role, status, created_at, updated_at FROM admins ORDER BY created_at DESC"
    );
    // Return passwords as plain text (no decryption needed)
    return rows;
=======
      "SELECT id, first_name, last_name, email, role, created_at, updated_at FROM admins ORDER BY created_at DESC"
    );
    // Combine first_name and last_name into full_name for each admin
    return rows.map(admin => ({
      ...admin,
      full_name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
    }));
>>>>>>> 264c997f296322ec81499e01cc49e66f3b5ae4fb
  } catch (error) {
    console.error("❌ Error in getAllAdmins:", error);
    throw error;
  }
};

// GET admin by ID
export const getAdminById = async (id) => {
  const [rows] = await dbp.query(
<<<<<<< HEAD
    "SELECT id, first_name, last_name, email, phone, password, role, status, created_at, updated_at FROM admins WHERE id = ?",
    [id]
  );
  // Return password as plain text (no decryption needed)
=======
    "SELECT id, first_name, last_name, email, role, created_at, updated_at FROM admins WHERE id = ?",
    [id]
  );
  if (rows[0]) {
    // Combine first_name and last_name into full_name
    rows[0].full_name = `${rows[0].first_name || ''} ${rows[0].last_name || ''}`.trim();
  }
>>>>>>> 264c997f296322ec81499e01cc49e66f3b5ae4fb
  return rows[0] || null;
};

// GET admin by email (for login - returns encrypted password for comparison)
export const getAdminByEmail = async (email) => {
  const [rows] = await dbp.query(
    "SELECT id, first_name, last_name, email, phone, password, role, status, created_at, updated_at FROM admins WHERE email = ?",
    [email]
  );
<<<<<<< HEAD
  // Don't decrypt here - we need encrypted password for login comparison
=======
  if (rows[0]) {
    // Combine first_name and last_name into full_name
    rows[0].full_name = `${rows[0].first_name || ''} ${rows[0].last_name || ''}`.trim();
  }
>>>>>>> 264c997f296322ec81499e01cc49e66f3b5ae4fb
  return rows[0] || null;
};

// UPDATE admin
export const updateAdminById = async (id, {
  first_name,
  last_name,
  email,
  phone,
  password,
  role,
  status
}) => {
  const updates = [];
  const values = [];

<<<<<<< HEAD
  if (first_name !== undefined) {
    updates.push("first_name = ?");
    values.push(first_name);
  }
  if (last_name !== undefined) {
    updates.push("last_name = ?");
    values.push(last_name);
=======
  if (full_name !== undefined) {
    // Split full_name into first_name and last_name
    const nameParts = (full_name || '').trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';
    updates.push("first_name = ?, last_name = ?");
    values.push(first_name, last_name);
>>>>>>> 264c997f296322ec81499e01cc49e66f3b5ae4fb
  }
  if (email !== undefined) {
    updates.push("email = ?");
    values.push(email);
  }
  if (phone !== undefined) {
    updates.push("phone = ?");
    values.push(phone || null);
  }
  if (password !== undefined && password.trim() !== "") {
    // Store password as plain text (no encryption)
    updates.push("password = ?");
    values.push(password);
  }
  if (role !== undefined) {
    updates.push("role = ?");
    values.push(role);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
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


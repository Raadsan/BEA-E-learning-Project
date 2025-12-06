// models/contactModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE contact
export const createContact = async ({ name, email, phone, message }) => {
  const [result] = await dbp.query(
    "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, message]
  );

  return {
    id: result.insertId,
    name,
    email,
    phone,
    message
  };
};

// GET all contacts
export const getAllContacts = async () => {
  const [rows] = await dbp.query(
    "SELECT * FROM contacts ORDER BY created_at DESC"
  );
  return rows;
};

// GET contact by ID
export const getContactById = async (id) => {
  const [rows] = await dbp.query("SELECT * FROM contacts WHERE id = ?", [id]);
  return rows[0];
};

// DELETE contact
export const deleteContactById = async (id) => {
  const [result] = await dbp.query("DELETE FROM contacts WHERE id = ?", [id]);
  return result.affectedRows;
};


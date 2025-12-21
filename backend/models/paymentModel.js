import db from "../database/dbconfig.js";
const dbp = db.promise();

export const createPayment = async ({ student_id, method, provider_transaction_id, amount, currency = 'USD', status = 'pending', raw_response = null }) => {
  const [result] = await dbp.query(
    `INSERT INTO payments (student_id, method, provider_transaction_id, amount, currency, status, raw_response) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [student_id || null, method, provider_transaction_id || null, amount, currency, status, JSON.stringify(raw_response) || null]
  );
  const [rows] = await dbp.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
  return rows[0];
};

export const getPaymentsForStudent = async (studentId) => {
  const [rows] = await dbp.query('SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
  return rows;
};
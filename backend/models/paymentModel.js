import db from "../database/dbconfig.js";
const dbp = db.promise();

export const createPayment = async ({ student_id, ielts_student_id, method, provider_transaction_id, amount, currency = 'USD', status = 'paid', raw_response = null, payer_phone = null, program_id = null }) => {
  try {
    console.log(`📝 SQL: INSERT INTO payments ... with student_id: ${student_id}, ielts_student_id: ${ielts_student_id}, amount: ${amount}`);
    const [result] = await dbp.query(
      `INSERT INTO payments (student_id, ielts_student_id, method, provider_transaction_id, amount, currency, status, raw_response, payer_phone, program_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id || null, ielts_student_id || null, method, provider_transaction_id || null, amount, currency, status, JSON.stringify(raw_response) || null, payer_phone, program_id]
    );
    console.log(`✅ SQL Result: Inserted ID ${result.insertId}`);
    const [rows] = await dbp.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (err) {
    console.error('❌ SQL ERROR in createPayment:', err.message);
    console.error('❌ Full Error:', err);
    throw err; // Re-throw so controller can handle
  }
};

export const getPaymentsForStudent = async (studentId) => {
  const [rows] = await dbp.query(
    `SELECT pay.id, pay.student_id, pay.amount, pay.currency, pay.status, 
            pay.method as payment_method, pay.created_at as payment_date, 
            pay.provider_transaction_id, pay.payer_phone,
            COALESCE(CONVERT(p.title USING utf8mb4), CONVERT(pay.program_id USING utf8mb4), CONVERT(s.chosen_program USING utf8mb4), CONVERT(it.chosen_program USING utf8mb4), 'Proficiency Test') as program_name,
            COALESCE(CONVERT(s.full_name USING utf8mb4), CONCAT(CONVERT(it.first_name USING utf8mb4), ' ', CONVERT(it.last_name USING utf8mb4)), CONCAT(CONVERT(pto.first_name USING utf8mb4), ' ', CONVERT(pto.last_name USING utf8mb4))) as student_name,
            COALESCE(pay.raw_response, '') as description
     FROM payments pay 
     LEFT JOIN programs p ON (CONVERT(pay.program_id USING utf8mb4) = CONVERT(p.id USING utf8mb4) OR CONVERT(pay.program_id USING utf8mb4) = CONVERT(p.title USING utf8mb4))
     LEFT JOIN students s ON pay.student_id = s.student_id
     LEFT JOIN programs p2 ON (CONVERT(s.chosen_program USING utf8mb4) = CONVERT(p2.id USING utf8mb4) OR CONVERT(s.chosen_program USING utf8mb4) = CONVERT(p2.title USING utf8mb4))
     LEFT JOIN IELTSTOEFL it ON (pay.student_id = it.student_id OR pay.ielts_student_id = it.student_id)
     LEFT JOIN ProficiencyTestOnly pto ON pay.student_id = pto.student_id
     WHERE pay.student_id = ? OR pay.ielts_student_id = ?
     ORDER BY pay.created_at DESC`,
    [studentId, studentId]
  );
  return rows;
};

export const getAllPayments = async () => {
  const [rows] = await dbp.query(
    `SELECT pay.id, pay.student_id, pay.amount, pay.currency, pay.status, 
              pay.method as payment_method, pay.created_at as payment_date, 
              pay.provider_transaction_id, pay.payer_phone,
              COALESCE(CONVERT(p.title USING utf8mb4), CONVERT(p2.title USING utf8mb4), CONVERT(it.chosen_program USING utf8mb4), CONVERT(s.chosen_program USING utf8mb4), CONVERT(pay.program_id USING utf8mb4), 'Proficiency Test') as program_name,
              COALESCE(CONVERT(s.full_name USING utf8mb4), CONCAT(CONVERT(it.first_name USING utf8mb4), ' ', CONVERT(it.last_name USING utf8mb4)), CONCAT(CONVERT(pto.first_name USING utf8mb4), ' ', CONVERT(pto.last_name USING utf8mb4))) as student_name,
              COALESCE(pay.raw_response, '') as description
       FROM payments pay 
       LEFT JOIN programs p ON (CONVERT(pay.program_id USING utf8mb4) = CONVERT(p.id USING utf8mb4) OR CONVERT(pay.program_id USING utf8mb4) = CONVERT(p.title USING utf8mb4))
       LEFT JOIN students s ON pay.student_id = s.student_id
       LEFT JOIN programs p2 ON (CONVERT(s.chosen_program USING utf8mb4) = CONVERT(p2.id USING utf8mb4) OR CONVERT(s.chosen_program USING utf8mb4) = CONVERT(p2.title USING utf8mb4))
       LEFT JOIN IELTSTOEFL it ON (pay.student_id = it.student_id OR pay.ielts_student_id = it.student_id)
       LEFT JOIN ProficiencyTestOnly pto ON pay.student_id = pto.student_id
       ORDER BY pay.created_at DESC`
  );
  return rows;
};
import db from "../database/dbconfig.js";
import { generateStudentId } from "../utils/idGenerator.js";

const dbp = db.promise();

// Create Student
export const createStudent = async (data) => {
    const {
        first_name, last_name, email, phone, password, chosen_program, age, sex,
        residency_country, residency_city, exam_type, verification_method,
        certificate_institution, certificate_date, certificate_document,
        exam_booking_date, exam_booking_time, status,
        payment_method, transaction_id, payment_amount, payer_phone
    } = data;

    const student_id = await generateStudentId('IELTSTOEFL', chosen_program);

    const query = `
    INSERT INTO IELTSTOEFL (
      student_id, first_name, last_name, email, phone, password, chosen_program, age, sex,
      residency_country, residency_city, exam_type, verification_method,
      certificate_institution, certificate_date, certificate_document,
      exam_booking_date, exam_booking_time, status,
      payment_method, transaction_id, payment_amount, payer_phone,
      expiry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1440 MINUTE))
  `;

    const values = [
        student_id,
        first_name, last_name, email, phone, password, chosen_program, age, sex,
        residency_country, residency_city, exam_type, verification_method,
        certificate_institution || null, certificate_date || null, certificate_document || null,
        exam_booking_date || null, exam_booking_time || null, status || 'Pending',
        payment_method || null, transaction_id || null, payment_amount || null, payer_phone || null
    ];

    const [result] = await dbp.query(query, values);
    const [newStudent] = await dbp.query("SELECT * FROM IELTSTOEFL WHERE student_id = ?", [student_id]);
    return newStudent[0];
};

// Get All Students
export const getAllStudents = async () => {
    const [rows] = await dbp.query("SELECT *, (expiry_date < NOW()) as is_expired FROM IELTSTOEFL ORDER BY registration_date DESC");
    return rows;
};

// Get Student by Email
export const getStudentByEmail = async (email) => {
    const [rows] = await dbp.query("SELECT *, (expiry_date < NOW()) as is_expired FROM IELTSTOEFL WHERE email = ?", [email]);
    return rows[0];
};

// Get Student by ID
export const getStudentById = async (id) => {
    const [rows] = await dbp.query("SELECT *, (expiry_date < NOW()) as is_expired FROM IELTSTOEFL WHERE student_id = ?", [id]);
    return rows[0];
};

// Update Student
export const updateStudent = async (id, data) => {
    // Generate dynamic update query
    const keys = Object.keys(data);
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    if (keys.length === 0) return 0;

    const [result] = await dbp.query(`UPDATE IELTSTOEFL SET ${updates} WHERE student_id = ?`, values);
    return result.affectedRows;
};

// Extend Deadline by custom duration (minutes or hours converted to minutes)
export const extendDeadline = async (id, durationMinutes = 1440) => {
    const [result] = await dbp.query(
        "UPDATE IELTSTOEFL SET expiry_date = DATE_ADD(NOW(), INTERVAL ? MINUTE), is_extended = TRUE, admin_expiry_notified = FALSE, reminder_sent = FALSE WHERE student_id = ?",
        [durationMinutes, id]
    );
    return result.affectedRows;
};

// Assign to Class (sets status to approved and sets class_id)
export const assignToClass = async (id, classId) => {
    const [result] = await dbp.query(
        "UPDATE IELTSTOEFL SET status = 'approved', class_id = ? WHERE student_id = ?",
        [classId, id]
    );
    return result.affectedRows;
};

// Reject Student (set status to rejected and clear class_id)
export const rejectStudent = async (id) => {
    const [result] = await dbp.query(
        "UPDATE IELTSTOEFL SET status = 'rejected', class_id = NULL WHERE student_id = ?",
        [id]
    );
    return result.affectedRows;
};

// Approve Student
export const approveStudent = async (id) => {
    const [result] = await dbp.query(
        "UPDATE IELTSTOEFL SET status = 'approved' WHERE student_id = ?",
        [id]
    );
    return result.affectedRows;
};

// Delete Student
export const deleteStudent = async (id) => {
    const [result] = await dbp.query("DELETE FROM IELTSTOEFL WHERE student_id = ?", [id]);
    return result.affectedRows;
};

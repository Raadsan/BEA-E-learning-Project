import db from "../database/dbconfig.js";
import { generateStudentId } from "../utils/idGenerator.js";

const dbp = db.promise();

// Create Proficiency Test Only Candidate
export const createCandidate = async (data) => {
    const {
        first_name, last_name, email, phone, password,
        educational_level, reason_essay,
        status, payment_status,
        age, sex, residency_country, residency_city
    } = data;

    // Generate specialized CRT (Certificate) ID
    const student_id = await generateStudentId('ProficiencyTestStudents', 'Proficiency Test Only');


    const query = `
    INSERT INTO ProficiencyTestStudents (
      student_id, first_name, last_name, email, phone, password, 
      educational_level, reason_essay, status, payment_status,
      age, sex, residency_country, residency_city,
      expiry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 100 YEAR))
  `;

    const values = [
        student_id,
        first_name, last_name, email, phone, password,
        educational_level, reason_essay,
        status || 'Pending', payment_status || 'unpaid',
        age || null, sex || null, residency_country || null, residency_city || null
    ];

    const [result] = await dbp.query(query, values);
    const [newCandidate] = await dbp.query("SELECT * FROM ProficiencyTestStudents WHERE student_id = ?", [student_id]);
    return newCandidate[0];
};

// Get All Candidates
export const getAllCandidates = async () => {
    const [rows] = await dbp.query("SELECT *, (expiry_date < NOW()) as is_expired FROM ProficiencyTestStudents ORDER BY registration_date DESC");
    return rows;
};

// Get Candidate by ID
export const getCandidateById = async (id) => {
    const [rows] = await dbp.query("SELECT *, (expiry_date < NOW()) as is_expired FROM ProficiencyTestStudents WHERE student_id = ?", [id]);
    return rows[0];
};

// Get Candidate by Email (for Login)
export const getCandidateByEmail = async (email) => {
    const [rows] = await dbp.query("SELECT *, (expiry_date < NOW()) as is_expired FROM ProficiencyTestStudents WHERE email = ?", [email]);
    return rows[0];
};


// Update Candidate
export const updateCandidate = async (id, data) => {
    const keys = Object.keys(data);
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    if (keys.length === 0) return 0;

    const [result] = await dbp.query(`UPDATE ProficiencyTestStudents SET ${updates} WHERE student_id = ?`, values);
    return result.affectedRows;
};

// Extend/Reset Entry window
export const extendDeadline = async (id, durationMinutes = 30) => {
    const [result] = await dbp.query(
        "UPDATE ProficiencyTestStudents SET expiry_date = DATE_ADD(NOW(), INTERVAL ? MINUTE), is_extended = TRUE, admin_expiry_notified = FALSE, reminder_sent = FALSE WHERE student_id = ?",
        [durationMinutes, id]
    );
    return result.affectedRows;
};

// Approve Candidate
export const approveCandidate = async (id) => {
    const [result] = await dbp.query(
        "UPDATE ProficiencyTestStudents SET status = 'Approved' WHERE student_id = ?",
        [id]
    );
    return result.affectedRows;
};

// Reject Candidate
export const rejectCandidate = async (id) => {
    const [result] = await dbp.query(
        "UPDATE ProficiencyTestStudents SET status = 'Rejected' WHERE student_id = ?",
        [id]
    );
    return result.affectedRows;
};

// Delete Candidate
export const deleteCandidate = async (id) => {
    const [result] = await dbp.query("DELETE FROM ProficiencyTestStudents WHERE student_id = ?", [id]);
    return result.affectedRows;
};

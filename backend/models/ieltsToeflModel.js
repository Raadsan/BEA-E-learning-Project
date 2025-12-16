import db from "../database/dbconfig.js";

const dbp = db.promise();

// Create Student
export const createStudent = async (data) => {
    const {
        first_name, last_name, email, phone, password, chosen_program, age, gender,
        residency_country, residency_city, exam_type, verification_method,
        certificate_institution, certificate_date, certificate_document,
        exam_booking_date, exam_booking_time, status
    } = data;

    const query = `
    INSERT INTO IELTSTOEFL (
      first_name, last_name, email, phone, password, chosen_program, age, gender,
      residency_country, residency_city, exam_type, verification_method,
      certificate_institution, certificate_date, certificate_document,
      exam_booking_date, exam_booking_time, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
        first_name, last_name, email, phone, password, chosen_program, age, gender,
        residency_country, residency_city, exam_type, verification_method,
        certificate_institution || null, certificate_date || null, certificate_document || null,
        exam_booking_date || null, exam_booking_time || null, status || 'Pending'
    ];

    const [result] = await dbp.query(query, values);
    const [newStudent] = await dbp.query("SELECT * FROM IELTSTOEFL WHERE id = ?", [result.insertId]);
    return newStudent[0];
};

// Get All Students
export const getAllStudents = async () => {
    const [rows] = await dbp.query("SELECT * FROM IELTSTOEFL ORDER BY registration_date DESC");
    return rows;
};

// Get Student by ID
export const getStudentById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM IELTSTOEFL WHERE id = ?", [id]);
    return rows[0];
};

// Update Student
export const updateStudent = async (id, data) => {
    // Generate dynamic update query
    const keys = Object.keys(data);
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    if (keys.length === 0) return 0;

    const [result] = await dbp.query(`UPDATE IELTSTOEFL SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
};

// Delete Student
export const deleteStudent = async (id) => {
    const [result] = await dbp.query("DELETE FROM IELTSTOEFL WHERE id = ?", [id]);
    return result.affectedRows;
};

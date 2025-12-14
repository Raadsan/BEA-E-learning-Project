import db from "../database/dbconfig.js";

const dbp = db.promise();

export const markAttendance = async (data) => {
    const { class_id, student_id, date, hour1, hour2 } = data;

    // Upsert: Insert or Update if exists
    const query = `
    INSERT INTO attendance (class_id, student_id, date, hour1, hour2)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    hour1 = VALUES(hour1),
    hour2 = VALUES(hour2)
  `;

    const [result] = await dbp.query(query, [
        class_id,
        student_id,
        date,
        hour1 ? 1 : 0,
        hour2 ? 1 : 0
    ]);

    return result;
};

export const getAttendance = async (class_id, date) => {
    const query = `
    SELECT * FROM attendance 
    WHERE class_id = ? AND date = ?
  `;

    const [rows] = await dbp.query(query, [class_id, date]);
    return rows;
};

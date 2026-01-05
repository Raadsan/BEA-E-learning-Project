import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE timetable entry
export const createTimetableEntry = async ({
    program_id,
    subprogram_id,
    date,
    day,
    start_time,
    end_time,
    subject,
    teacher_id,
    type
}) => {
    const [result] = await dbp.query(
        `INSERT INTO timetables (
      program_id, subprogram_id, date, day, start_time, end_time, subject, teacher_id, type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [program_id, subprogram_id, date, day, start_time, end_time, subject, teacher_id, type]
    );

    const [newEntry] = await dbp.query("SELECT * FROM timetables WHERE id = ?", [result.insertId]);
    return newEntry[0];
};

// GET all timetable entries for a subprogram
export const getTimetableBySubprogram = async (subprogram_id) => {
    const [rows] = await dbp.query(
        `SELECT t.*, te.full_name as teacher_name 
     FROM timetables t 
     LEFT JOIN teachers te ON t.teacher_id = te.id 
     WHERE t.subprogram_id = ? 
     ORDER BY t.day, t.start_time`,
        [subprogram_id]
    );
    return rows;
};

// GET all timetable entries for a program (optional, maybe helpful)
export const getTimetableByProgram = async (program_id) => {
    const [rows] = await dbp.query(
        `SELECT t.*, te.full_name as teacher_name 
       FROM timetables t 
       LEFT JOIN teachers te ON t.teacher_id = te.id 
       WHERE t.program_id = ? 
       ORDER BY t.day, t.start_time`,
        [program_id]
    );
    return rows;
};

// UPDATE timetable entry
export const updateTimetableEntry = async (id, {
    date,
    day,
    start_time,
    end_time,
    subject,
    teacher_id,
    type
}) => {
    const updates = [];
    const values = [];

    if (date !== undefined) {
        updates.push("date = ?");
        values.push(date);
    }
    if (day !== undefined) {
        updates.push("day = ?");
        values.push(day);
    }
    if (start_time !== undefined) {
        updates.push("start_time = ?");
        values.push(start_time);
    }
    if (end_time !== undefined) {
        updates.push("end_time = ?");
        values.push(end_time);
    }
    if (subject !== undefined) {
        updates.push("subject = ?");
        values.push(subject);
    }
    if (teacher_id !== undefined) {
        updates.push("teacher_id = ?");
        values.push(teacher_id);
    }
    if (type !== undefined) {
        updates.push("type = ?");
        values.push(type);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE timetables SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    return result.affectedRows;
};

// DELETE timetable entry
export const deleteTimetableEntry = async (id) => {
    const [result] = await dbp.query("DELETE FROM timetables WHERE id = ?", [id]);
    return result.affectedRows;
};

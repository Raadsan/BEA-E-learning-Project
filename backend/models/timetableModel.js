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

// ===== WEEKLY SCHEDULE METHODS (for long-term programs) =====

// GET weekly schedule entries for a subprogram by month and year
export const getWeeklyScheduleBySubprogram = async (subprogram_id, month, year) => {
    let query = `SELECT * FROM timetables WHERE subprogram_id = ? AND week_number IS NOT NULL`;
    const params = [subprogram_id];

    if (month) {
        query += ` AND month = ?`;
        params.push(month);
    }
    if (year) {
        query += ` AND year = ?`;
        params.push(year);
    }

    query += ` ORDER BY week_number, FIELD(day, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')`;

    const [rows] = await dbp.query(query, params);
    return rows;
};

// CREATE weekly schedule entry
export const createWeeklyEntry = async ({
    program_id,
    subprogram_id,
    week_number,
    day,
    activity_type,
    activity_title,
    activity_description,
    month,
    year
}) => {
    const [result] = await dbp.query(
        `INSERT INTO timetables (
            program_id, subprogram_id, day, week_number, activity_type, activity_title, activity_description, month, year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [program_id, subprogram_id, day, week_number, activity_type, activity_title, activity_description, month, year]
    );

    const [newEntry] = await dbp.query("SELECT * FROM timetables WHERE id = ?", [result.insertId]);
    return newEntry[0];
};

// UPDATE weekly schedule entry
export const updateWeeklyEntry = async (id, {
    week_number,
    day,
    activity_type,
    activity_title,
    activity_description,
    month,
    year
}) => {
    const updates = [];
    const values = [];

    if (week_number !== undefined) {
        updates.push("week_number = ?");
        values.push(week_number);
    }
    if (day !== undefined) {
        updates.push("day = ?");
        values.push(day);
    }
    if (activity_type !== undefined) {
        updates.push("activity_type = ?");
        values.push(activity_type);
    }
    if (activity_title !== undefined) {
        updates.push("activity_title = ?");
        values.push(activity_title);
    }
    if (activity_description !== undefined) {
        updates.push("activity_description = ?");
        values.push(activity_description);
    }
    if (month !== undefined) {
        updates.push("month = ?");
        values.push(month);
    }
    if (year !== undefined) {
        updates.push("year = ?");
        values.push(year);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE timetables SET ${updates.join(", ")} WHERE id = ? AND week_number IS NOT NULL`,
        values
    );

    return result.affectedRows;
};

// DELETE weekly schedule entry
export const deleteWeeklyEntry = async (id) => {
    const [result] = await dbp.query(
        "DELETE FROM timetables WHERE id = ? AND week_number IS NOT NULL",
        [id]
    );
    return result.affectedRows;
};

// BULK CREATE weekly schedule entries
export const bulkCreateWeeklyEntries = async (entries) => {
    if (!entries || entries.length === 0) return [];

    const values = entries.map(entry => [
        entry.program_id,
        entry.subprogram_id,
        entry.day,
        entry.week_number,
        entry.activity_type || "Session",
        entry.activity_title,
        entry.activity_description || null,
        entry.month || null,
        entry.year || null
    ]);

    const placeholders = entries.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const flatValues = values.flat();

    await dbp.query(
        `INSERT INTO timetables (
            program_id, subprogram_id, day, week_number, activity_type, activity_title, activity_description, month, year
        ) VALUES ${placeholders}`,
        flatValues
    );

    return { success: true, count: entries.length };
};

// DELETE all weekly entries for a subprogram
export const deleteAllWeeklyBySubprogram = async (subprogram_id) => {
    const [result] = await dbp.query(
        "DELETE FROM timetables WHERE subprogram_id = ? AND week_number IS NOT NULL",
        [subprogram_id]
    );
    return result.affectedRows;
};


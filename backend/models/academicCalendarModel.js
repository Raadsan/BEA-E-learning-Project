import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE calendar entry
export const createCalendarEntry = async ({
    program_id,
    subprogram_id,
    week_number,
    day_of_week,
    activity_type,
    activity_title,
    activity_description
}) => {
    const [result] = await dbp.query(
        `INSERT INTO academic_calendar (
            program_id, subprogram_id, week_number, day_of_week, 
            activity_type, activity_title, activity_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [program_id, subprogram_id, week_number, day_of_week, activity_type, activity_title, activity_description]
    );

    const [newEntry] = await dbp.query("SELECT * FROM academic_calendar WHERE id = ?", [result.insertId]);
    return newEntry[0];
};

// GET all calendar entries for a subprogram
export const getCalendarBySubprogram = async (subprogram_id) => {
    const [rows] = await dbp.query(
        `SELECT * FROM academic_calendar 
         WHERE subprogram_id = ? 
         ORDER BY week_number, 
         FIELD(day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')`,
        [subprogram_id]
    );
    return rows;
};

// GET all calendar entries for a program
export const getCalendarByProgram = async (program_id) => {
    const [rows] = await dbp.query(
        `SELECT * FROM academic_calendar 
         WHERE program_id = ? 
         ORDER BY week_number, 
         FIELD(day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')`,
        [program_id]
    );
    return rows;
};

// UPDATE calendar entry
export const updateCalendarEntry = async (id, {
    week_number,
    day_of_week,
    activity_type,
    activity_title,
    activity_description
}) => {
    const updates = [];
    const values = [];

    if (week_number !== undefined) {
        updates.push("week_number = ?");
        values.push(week_number);
    }
    if (day_of_week !== undefined) {
        updates.push("day_of_week = ?");
        values.push(day_of_week);
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

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE academic_calendar SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    return result.affectedRows;
};

// DELETE calendar entry
export const deleteCalendarEntry = async (id) => {
    const [result] = await dbp.query("DELETE FROM academic_calendar WHERE id = ?", [id]);
    return result.affectedRows;
};

// BULK CREATE calendar entries
export const bulkCreateCalendarEntries = async (entries) => {
    if (!entries || entries.length === 0) return [];

    const values = entries.map(entry => [
        entry.program_id,
        entry.subprogram_id,
        entry.week_number,
        entry.day_of_week,
        entry.activity_type,
        entry.activity_title,
        entry.activity_description || null
    ]);

    const placeholders = entries.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
    const flatValues = values.flat();

    await dbp.query(
        `INSERT INTO academic_calendar (
            program_id, subprogram_id, week_number, day_of_week,
            activity_type, activity_title, activity_description
        ) VALUES ${placeholders}`,
        flatValues
    );

    return { success: true, count: entries.length };
};

// DELETE all entries for a subprogram (useful for reset)
export const deleteAllBySubprogram = async (subprogram_id) => {
    const [result] = await dbp.query(
        "DELETE FROM academic_calendar WHERE subprogram_id = ?",
        [subprogram_id]
    );
    return result.affectedRows;
};

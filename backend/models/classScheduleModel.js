// models/classScheduleModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

export const createClassSchedule = async ({ class_id, session_title, zoom_link, schedule_date, start_time, end_time }) => {
    const [result] = await dbp.query(
        "INSERT INTO class_schedules (class_id, session_title, zoom_link, schedule_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)",
        [class_id, session_title || null, zoom_link || null, schedule_date || null, start_time || null, end_time || null]
    );
    return result.insertId;
};

export const getClassSchedulesByClassId = async (class_id) => {
    const [rows] = await dbp.query(
        "SELECT * FROM class_schedules WHERE class_id = ? ORDER BY schedule_date ASC, start_time ASC",
        [class_id]
    );
    return rows;
};

export const getAllClassSchedules = async () => {
    const [rows] = await dbp.query(
        `SELECT cs.*, cl.class_name 
     FROM class_schedules cs 
     JOIN classes cl ON cs.class_id = cl.id 
     ORDER BY cs.schedule_date DESC`
    );
    return rows;
};

export const updateClassSchedule = async (id, data) => {
    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            updates.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE class_schedules SET ${updates.join(", ")} WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

export const deleteClassSchedule = async (id) => {
    const [result] = await dbp.query("DELETE FROM class_schedules WHERE id = ?", [id]);
    return result.affectedRows;
};

export const getStudentSchedules = async (student_id) => {
    const [rows] = await dbp.query(
        `SELECT cs.*, cl.class_name 
     FROM class_schedules cs 
     JOIN classes cl ON cs.class_id = cl.id
     JOIN students s ON cl.id = s.class_id
     WHERE s.id = ?
     ORDER BY cs.schedule_date ASC`,
        [student_id]
    );
    return rows;
};

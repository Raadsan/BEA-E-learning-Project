import db from "../database/dbconfig.js";

const dbp = db.promise();

export const getAllAnnouncements = async () => {
    const [rows] = await dbp.query("SELECT * FROM announcements ORDER BY created_at DESC");
    return rows;
};

export const updateAnnouncement = async (id, data) => {
    const { title, content, targetAudience, publishDate, status } = data;
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (content !== undefined) { updates.push("content = ?"); values.push(content); }
    if (targetAudience !== undefined) { updates.push("target_audience = ?"); values.push(targetAudience); }
    if (publishDate !== undefined) { updates.push("publish_date = ?"); values.push(publishDate); }
    if (status !== undefined) { updates.push("status = ?"); values.push(status); }

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE announcements SET ${updates.join(", ")} WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

export const createAnnouncement = async (data) => {
    const { title, content, targetAudience, targetType, targetId, publishDate, status } = data;
    const [result] = await dbp.query(
        "INSERT INTO announcements (title, content, target_audience, target_type, target_id, publish_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, content, targetAudience, targetType || 'manual', targetId || null, publishDate, status]
    );
    const [newAnnouncement] = await dbp.query("SELECT * FROM announcements WHERE id = ?", [result.insertId]);
    return newAnnouncement[0];
};

export const getAnnouncementsForTeacher = async (teacherId, classIds = []) => {
    let query = `
        SELECT * FROM announcements 
        WHERE status = 'Published' 
        AND (
            target_type = 'all_teachers'
            OR target_type = 'all_users'
    `;

    const params = [];

    if (classIds.length > 0) {
        query += ` OR (target_type = 'by_class' AND target_id IN (?))`;
        params.push(classIds);
    }

    query += `) ORDER BY created_at DESC`;

    const [rows] = await dbp.query(query, params);
    return rows;
};

export const deleteAnnouncement = async (id) => {
    const [result] = await dbp.query("DELETE FROM announcements WHERE id = ?", [id]);
    return result.affectedRows;
};

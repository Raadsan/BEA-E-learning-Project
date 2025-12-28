import db from "../database/dbconfig.js";

const dbp = db.promise();

// GET all news
export const getAllNews = async (onlyActive = true) => {
    let query = "SELECT * FROM news_events";
    if (onlyActive) {
        query += " WHERE status = 'active'";
    }
    query += " ORDER BY event_date ASC";
    const [rows] = await dbp.query(query);
    return rows;
};

// CREATE news
export const createNews = async ({ title, description, event_date, type, status }) => {
    const [result] = await dbp.query(
        "INSERT INTO news_events (title, description, event_date, type, status) VALUES (?, ?, ?, ?, ?)",
        [title, description, event_date, type || 'news', status || 'active']
    );
    const [newItem] = await dbp.query("SELECT * FROM news_events WHERE id = ?", [result.insertId]);
    return newItem[0];
};

// UPDATE news
export const updateNews = async (id, { title, description, event_date, type, status }) => {
    const updates = [];
    const values = [];

    if (title !== undefined) {
        updates.push("title = ?");
        values.push(title);
    }
    if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
    }
    if (event_date !== undefined) {
        updates.push("event_date = ?");
        values.push(event_date);
    }
    if (type !== undefined) {
        updates.push("type = ?");
        values.push(type);
    }
    if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE news_events SET ${updates.join(", ")} WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

// DELETE news
export const deleteNews = async (id) => {
    const [result] = await dbp.query("DELETE FROM news_events WHERE id = ?", [id]);
    return result.affectedRows;
};

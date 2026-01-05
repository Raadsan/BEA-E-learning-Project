import db from '../database/dbconfig.js';

const dbp = db.promise();

// Get events for a specific subprogram within a date range (e.g., a month)
export const getEventsBySubprogram = async (subprogramId, startDate, endDate) => {
    const query = `
        SELECT * FROM timetable_events 
        WHERE subprogram_id = ? 
        AND event_date BETWEEN ? AND ?
        ORDER BY event_date ASC
    `;
    const [rows] = await dbp.query(query, [subprogramId, startDate, endDate]);
    return rows;
};

// Create a new event
export const createEvent = async (eventData) => {
    const { subprogram_id, event_date, type, title, description } = eventData;
    const query = `
        INSERT INTO timetable_events (subprogram_id, event_date, type, title, description)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await dbp.query(query, [subprogram_id, event_date, type, title, description]);
    return result.insertId;
};

// Update an event
export const updateEvent = async (id, eventData) => {
    const { event_date, type, title, description } = eventData;
    const query = `
        UPDATE timetable_events 
        SET event_date = ?, type = ?, title = ?, description = ?
        WHERE id = ?
    `;
    const [result] = await dbp.query(query, [event_date, type, title, description, id]);
    return result.affectedRows > 0;
};

// Delete an event
export const deleteEvent = async (id) => {
    const query = 'DELETE FROM timetable_events WHERE id = ?';
    const [result] = await dbp.query(query, [id]);
    return result.affectedRows > 0;
};

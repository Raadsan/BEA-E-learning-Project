import db from '../database/dbconfig.js';

const dbp = db.promise();

const CourseTimelineModel = {
    // Get all active timelines ordered by display_order
    async getAllTimelines() {
        const query = `
      SELECT id, term_serial, start_date, end_date, holidays, display_order, is_active, created_at, updated_at
      FROM course_timeline
      WHERE is_active = TRUE
      ORDER BY display_order ASC
    `;
        const [rows] = await dbp.query(query);
        return rows;
    },

    // Get all timelines including inactive (for admin)
    async getAllTimelinesAdmin() {
        const query = `
      SELECT id, term_serial, start_date, end_date, holidays, display_order, is_active, created_at, updated_at
      FROM course_timeline
      ORDER BY display_order ASC
    `;
        const [rows] = await dbp.query(query);
        return rows;
    },

    // Get timeline by ID
    async getTimelineById(id) {
        const query = `
      SELECT id, term_serial, start_date, end_date, holidays, display_order, is_active, created_at, updated_at
      FROM course_timeline
      WHERE id = ?
    `;
        const [rows] = await dbp.query(query, [id]);
        return rows[0];
    },

    // Create new timeline
    async createTimeline(data) {
        const { term_serial, start_date, end_date, holidays, display_order } = data;

        const query = `
      INSERT INTO course_timeline (term_serial, start_date, end_date, holidays, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, TRUE)
    `;

        const [result] = await dbp.query(query, [
            term_serial,
            start_date,
            end_date,
            holidays || null,
            display_order
        ]);

        return result.insertId;
    },

    // Update timeline
    async updateTimeline(id, data) {
        const { term_serial, start_date, end_date, holidays, display_order, is_active } = data;

        const query = `
      UPDATE course_timeline
      SET term_serial = ?, start_date = ?, end_date = ?, holidays = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `;

        const [result] = await dbp.query(query, [
            term_serial,
            start_date,
            end_date,
            holidays || null,
            display_order,
            is_active !== undefined ? is_active : true,
            id
        ]);

        return result.affectedRows > 0;
    },

    // Delete timeline (soft delete by setting is_active to false)
    async deleteTimeline(id) {
        const query = `
      UPDATE course_timeline
      SET is_active = FALSE
      WHERE id = ?
    `;
        const [result] = await dbp.query(query, [id]);
        return result.affectedRows > 0;
    },

    // Hard delete timeline (permanently remove)
    async hardDeleteTimeline(id) {
        const query = `DELETE FROM course_timeline WHERE id = ?`;
        const [result] = await dbp.query(query, [id]);
        return result.affectedRows > 0;
    },

    // Reorder timelines
    async reorderTimelines(orderData) {
        // orderData is an array of { id, display_order }
        const connection = await dbp.getConnection();

        try {
            await connection.beginTransaction();

            for (const item of orderData) {
                await connection.query(
                    'UPDATE course_timeline SET display_order = ? WHERE id = ?',
                    [item.display_order, item.id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Get next available display order
    async getNextDisplayOrder() {
        const query = `SELECT MAX(display_order) as max_order FROM course_timeline`;
        const [rows] = await dbp.query(query);
        return (rows[0].max_order || 0) + 1;
    },

    // Check if term_serial already exists
    async termSerialExists(term_serial, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM course_timeline WHERE term_serial = ?`;
        const params = [term_serial];

        if (excludeId) {
            query += ` AND id != ?`;
            params.push(excludeId);
        }

        const [rows] = await dbp.query(query, params);
        return rows[0].count > 0;
    }
};

export default CourseTimelineModel;

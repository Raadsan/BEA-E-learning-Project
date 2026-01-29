import db from '../database/dbconfig.js';

const dbp = db.promise();

const TestimonialsModel = {
    // Get all active testimonials for public display
    async getActiveTestimonials() {
        const query = `
      SELECT id, student_name, student_role, quote, image_url, initials, rating, is_active, created_at
      FROM testimonials
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `;
        const [rows] = await dbp.query(query);
        return rows;
    },

    // Get all testimonials for admin management
    async getAllTestimonialsAdmin() {
        const query = `
      SELECT id, student_name, student_role, quote, image_url, initials, rating, is_active, created_at, updated_at
      FROM testimonials
      ORDER BY created_at DESC
    `;
        const [rows] = await dbp.query(query);
        return rows;
    },

    // Get testimonial by ID
    async getTestimonialById(id) {
        const query = `
      SELECT id, student_name, student_role, quote, image_url, initials, rating, is_active, created_at, updated_at
      FROM testimonials
      WHERE id = ?
    `;
        const [rows] = await dbp.query(query, [id]);
        return rows[0];
    },

    // Create new testimonial
    async createTestimonial(data) {
        const { student_name, student_role, quote, image_url, initials, rating } = data;
        const query = `
      INSERT INTO testimonials (student_name, student_role, quote, image_url, initials, rating, is_active)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
    `;
        const [result] = await dbp.query(query, [
            student_name,
            student_role || null,
            quote,
            image_url || null,
            initials || null,
            rating || 5
        ]);
        return result.insertId;
    },

    // Update testimonial
    async updateTestimonial(id, data) {
        const { student_name, student_role, quote, image_url, initials, rating, is_active } = data;
        const query = `
      UPDATE testimonials
      SET student_name = ?, student_role = ?, quote = ?, image_url = ?, initials = ?, rating = ?, is_active = ?
      WHERE id = ?
    `;
        const [result] = await dbp.query(query, [
            student_name,
            student_role,
            quote,
            image_url,
            initials,
            rating,
            is_active !== undefined ? is_active : true,
            id
        ]);
        return result.affectedRows > 0;
    },

    // Hard delete testimonial
    async deleteTestimonial(id) {
        const query = `DELETE FROM testimonials WHERE id = ?`;
        const [result] = await dbp.query(query, [id]);
        return result.affectedRows > 0;
    }
};

export default TestimonialsModel;

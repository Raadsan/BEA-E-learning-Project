import TestimonialsModel from '../models/testimonialsModel.js';

const TestimonialsController = {
    // GET all active testimonials (Public)
    async getTestimonials(req, res) {
        try {
            const testimonials = await TestimonialsModel.getActiveTestimonials();
            res.json(testimonials);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            res.status(500).json({ error: 'Failed to fetch testimonials' });
        }
    },

    // GET all testimonials (Admin)
    async getTestimonialsAdmin(req, res) {
        try {
            const testimonials = await TestimonialsModel.getAllTestimonialsAdmin();
            res.json(testimonials);
        } catch (error) {
            console.error('Error fetching testimonials (admin):', error);
            res.status(500).json({ error: 'Failed to fetch testimonials' });
        }
    },

    // GET testimonial by ID (Admin)
    async getTestimonialById(req, res) {
        try {
            const { id } = req.params;
            const testimonial = await TestimonialsModel.getTestimonialById(id);
            if (!testimonial) {
                return res.status(404).json({ error: 'Testimonial not found' });
            }
            res.json(testimonial);
        } catch (error) {
            console.error('Error fetching testimonial by ID:', error);
            res.status(500).json({ error: 'Failed to fetch testimonial' });
        }
    },

    // POST create new testimonial (Admin)
    async createTestimonial(req, res) {
        try {
            const { student_name, student_role, quote, image_url, initials, rating } = req.body;

            if (!student_name || !quote) {
                return res.status(400).json({ error: 'Student name and quote are required' });
            }

            const testimonialId = await TestimonialsModel.createTestimonial({
                student_name,
                student_role,
                quote,
                image_url,
                initials,
                rating: rating || 5
            });

            res.status(201).json({
                message: 'Testimonial created successfully',
                id: testimonialId
            });
        } catch (error) {
            console.error('Error creating testimonial:', error);
            res.status(500).json({ error: 'Failed to create testimonial' });
        }
    },

    // PUT update testimonial (Admin)
    async updateTestimonial(req, res) {
        try {
            const { id } = req.params;
            const { student_name, student_role, quote, image_url, initials, rating, is_active } = req.body;

            const existing = await TestimonialsModel.getTestimonialById(id);
            if (!existing) {
                return res.status(404).json({ error: 'Testimonial not found' });
            }

            if (!student_name || !quote) {
                return res.status(400).json({ error: 'Student name and quote are required' });
            }

            const success = await TestimonialsModel.updateTestimonial(id, {
                student_name,
                student_role,
                quote,
                image_url,
                initials,
                rating,
                is_active: is_active !== undefined ? is_active : existing.is_active
            });

            if (success) {
                res.json({ message: 'Testimonial updated successfully' });
            } else {
                res.status(500).json({ error: 'Failed to update testimonial' });
            }
        } catch (error) {
            console.error('Error updating testimonial:', error);
            res.status(500).json({ error: 'Failed to update testimonial' });
        }
    },

    // DELETE testimonial (Admin)
    async deleteTestimonial(req, res) {
        try {
            const { id } = req.params;
            const success = await TestimonialsModel.deleteTestimonial(id);
            if (success) {
                res.json({ message: 'Testimonial deleted successfully' });
            } else {
                res.status(404).json({ error: 'Testimonial not found' });
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            res.status(500).json({ error: 'Failed to delete testimonial' });
        }
    }
};

export default TestimonialsController;

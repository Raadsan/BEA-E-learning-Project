import prisma from '../lib/prisma.js';

const TestimonialsController = {
    async getTestimonials(req, res) {
        try {
            const testimonials = await prisma.testimonials.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' } });
            res.json(testimonials);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async getTestimonialsAdmin(req, res) {
        try {
            const testimonials = await prisma.testimonials.findMany({ orderBy: { created_at: 'desc' } });
            res.json(testimonials);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async createTestimonial(req, res) {
        try {
            const { student_name, student_role, quote, image_url, initials, rating } = req.body;
            if (!student_name || !quote) return res.status(400).json({ error: 'Name and quote required' });
            const t = await prisma.testimonials.create({ data: { student_name, student_role, quote, image_url, initials, rating: rating || 5 } });
            res.status(201).json(t);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async updateTestimonial(req, res) {
        try {
            const updated = await prisma.testimonials.update({
                where: { id: parseInt(req.params.id) },
                data: req.body
            });
            res.json(updated);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async deleteTestimonial(req, res) {
        try {
            await prisma.testimonials.delete({ where: { id: parseInt(req.params.id) } });
            res.json({ message: 'Deleted' });
        } catch (err) { res.status(500).json({ error: err.message }); }
    }
};

export default TestimonialsController;

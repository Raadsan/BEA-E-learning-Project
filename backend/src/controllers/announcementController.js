import prisma from '../lib/prisma.js';

// GET ALL ANNOUNCEMENTS
export const getAnnouncements = async (req, res) => {
    try {
        const { classId } = req.query;
        let where = {};
        
        if (classId) {
            where = {
                OR: [
                    { target_audience: 'All Students' },
                    { target_id: parseInt(classId) }
                ]
            };
        }

        const announcements = await prisma.announcements.findMany({
            where,
            orderBy: { publish_date: 'desc' }
        });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, target_audience, publish_date, status, target_id } = req.body;
        const announcement = await prisma.announcements.create({
            data: {
                title,
                content,
                target_audience: target_audience || 'All Students',
                publish_date: publish_date ? new Date(publish_date) : new Date(),
                status: status || 'Published',
                target_id: target_id ? parseInt(target_id) : null
            }
        });
        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE ANNOUNCEMENT
export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.announcements.update({
            where: { id: parseInt(id) },
            data: {
                ...req.body,
                publish_date: req.body.publish_date ? new Date(req.body.publish_date) : undefined
            }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE ANNOUNCEMENT
export const deleteAnnouncement = async (req, res) => {
    try {
        await prisma.announcements.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET TEACHER ANNOUNCEMENTS
export const getTeacherAnnouncements = async (req, res) => {
    try {
        const teacherId = parseInt(req.user.userId);
        const classes = await prisma.classes.findMany({ where: { teacher_id: teacherId } });
        const classIds = classes.map(c => c.id);

        const announcements = await prisma.announcements.findMany({
            where: {
                OR: [
                    { target_audience: 'All Teachers' },
                    { target_id: { in: classIds } }
                ]
            },
            orderBy: { publish_date: 'desc' }
        });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

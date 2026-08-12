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
        const { title, content, target_audience, targetAudience, publish_date, publishDate, status, target_id, targetId } = req.body;
        const audience = target_audience || targetAudience || 'All Students';
        const tId = target_id || targetId;
        const pDate = publish_date || publishDate;
        const announcement = await prisma.announcements.create({
            data: {
                title,
                content,
                target_audience: audience,
                publish_date: pDate ? new Date(pDate) : new Date(),
                status: status || 'Published',
                target_id: tId ? parseInt(tId) : null
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
        const { title, content, target_audience, targetAudience, publish_date, publishDate, status, target_id, targetId } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (content !== undefined) data.content = content;
        if (target_audience || targetAudience) data.target_audience = target_audience || targetAudience;
        if (status !== undefined) data.status = status;
        if (publish_date || publishDate) data.publish_date = new Date(publish_date || publishDate);
        if (target_id || targetId) data.target_id = parseInt(target_id || targetId);

        const updated = await prisma.announcements.update({
            where: { id: parseInt(id) },
            data
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

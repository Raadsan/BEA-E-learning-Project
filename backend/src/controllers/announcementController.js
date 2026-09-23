import prisma from '../lib/prisma.js';

const resolveStudentClassId = async (userId, queryClassId) => {
    if (queryClassId) {
        const parsed = parseInt(queryClassId, 10);
        if (!Number.isNaN(parsed)) return parsed;
    }
    if (!userId) return null;

    const studentId = String(userId);
    const [regular, ielts] = await Promise.all([
        prisma.students.findUnique({
            where: { student_id: studentId },
            select: { class_id: true },
        }),
        prisma.iELTSTOEFL.findUnique({
            where: { student_id: studentId },
            select: { class_id: true },
        }),
    ]);

    return regular?.class_id || ielts?.class_id || null;
};

const buildStudentAnnouncementWhere = (classId) => {
    const or = [
        { target_audience: 'All Students' },
        { target_type: 'all_students' },
    ];

    if (classId) {
        or.push({
            AND: [
                { target_id: classId },
                {
                    OR: [
                        { target_type: 'by_class' },
                        { target_audience: { startsWith: 'Class:' } },
                    ],
                },
            ],
        });
    }

    return { OR: or };
};

// GET ALL ANNOUNCEMENTS
export const getAnnouncements = async (req, res) => {
    try {
        const { classId } = req.query;
        const role = req.user?.role;
        let where = {};

        if (role === 'student' || role === 'proficiency_student') {
            const studentClassId = await resolveStudentClassId(req.user.userId, classId);
            where = buildStudentAnnouncementWhere(studentClassId);
        } else if (classId) {
            const parsedClassId = parseInt(classId, 10);
            where = {
                OR: [
                    { target_audience: 'All Students' },
                    { target_type: 'all_students' },
                    { target_id: parsedClassId },
                ],
            };
        }

        const announcements = await prisma.announcements.findMany({
            where,
            orderBy: { publish_date: 'desc' },
        });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            content,
            target_audience,
            targetAudience,
            publish_date,
            publishDate,
            status,
            target_id,
            targetId,
            target_type,
            targetType,
        } = req.body;
        const audience = target_audience || targetAudience || 'All Students';
        const tId = target_id || targetId;
        const tType = target_type || targetType || 'manual';
        const pDate = publish_date || publishDate;
        const parsedTargetId = tId !== undefined && tId !== null && tId !== ''
            ? parseInt(tId, 10)
            : null;

        const announcement = await prisma.announcements.create({
            data: {
                title,
                content,
                target_audience: audience,
                target_type: tType,
                publish_date: pDate ? new Date(pDate) : new Date(),
                status: status || 'Published',
                target_id: Number.isNaN(parsedTargetId) ? null : parsedTargetId,
            },
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
        const {
            title,
            content,
            target_audience,
            targetAudience,
            publish_date,
            publishDate,
            status,
            target_id,
            targetId,
            target_type,
            targetType,
        } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (content !== undefined) data.content = content;
        if (target_audience || targetAudience) data.target_audience = target_audience || targetAudience;
        if (target_type || targetType) data.target_type = target_type || targetType;
        if (status !== undefined) data.status = status;
        if (publish_date || publishDate) data.publish_date = new Date(publish_date || publishDate);
        if (target_id !== undefined || targetId !== undefined) {
            const raw = target_id ?? targetId;
            if (raw === null || raw === '') {
                data.target_id = null;
            } else {
                const parsed = parseInt(raw, 10);
                data.target_id = Number.isNaN(parsed) ? null : parsed;
            }
        }

        const updated = await prisma.announcements.update({
            where: { id: parseInt(id, 10) },
            data,
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE ANNOUNCEMENT
export const deleteAnnouncement = async (req, res) => {
    try {
        await prisma.announcements.delete({ where: { id: parseInt(req.params.id, 10) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET TEACHER ANNOUNCEMENTS
export const getTeacherAnnouncements = async (req, res) => {
    try {
        const teacherId = parseInt(req.user.userId, 10);
        const classes = await prisma.classes.findMany({ where: { teacher_id: teacherId } });
        const classIds = classes.map((c) => c.id);

        const announcements = await prisma.announcements.findMany({
            where: {
                OR: [
                    { target_audience: 'All Teachers' },
                    { target_type: 'all_teachers' },
                    { target_id: { in: classIds } },
                ],
            },
            orderBy: { publish_date: 'desc' },
        });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

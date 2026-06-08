import prisma from '../lib/prisma.js';

const parseTime = (t) => {
    if (!t) return null;
    const str = String(t).trim();
    if (str.includes('T')) {
        const timePart = str.split('T')[1]?.replace('Z', '').split('.')[0] || '';
        const match = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (match) {
            const hours = match[1].padStart(2, '0');
            const minutes = match[2];
            const seconds = match[3] || '00';
            return new Date(`1970-01-01T${hours}:${minutes}:${seconds}.000Z`);
        }
    }
    const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    const seconds = match[3] || '00';
    return new Date(`1970-01-01T${hours}:${minutes}:${seconds}.000Z`);
};

export const createClassSchedule = async (req, res) => {
    try {
        const { class_id } = req.params;
        const body = req.body;

        if (Array.isArray(body)) {
            const results = await prisma.class_schedules.createMany({
                data: body.map(item => ({
                    class_id: parseInt(class_id),
                    session_title: item.session_title || item.title || null,
                    zoom_link: item.zoom_link,
                    schedule_date: item.schedule_date ? new Date(item.schedule_date) : null,
                    start_time: parseTime(item.start_time),
                    end_time: parseTime(item.end_time)
                }))
            });
            return res.status(201).json(results);
        }

        const { session_title, title, zoom_link, schedule_date, start_time, end_time } = body;
        const schedule = await prisma.class_schedules.create({
            data: {
                class_id: parseInt(class_id),
                session_title: session_title || title || null,
                zoom_link,
                schedule_date: schedule_date ? new Date(schedule_date) : null,
                start_time: parseTime(start_time),
                end_time: parseTime(end_time)
            }
        });
        res.status(201).json(schedule);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getClassSchedules = async (req, res) => {
    try {
        const schedules = await prisma.class_schedules.findMany({
            where: { class_id: parseInt(req.params.class_id) },
            orderBy: { schedule_date: 'asc' }
        });
        res.json(schedules);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllClassSchedules = async (req, res) => {
    try {
        const schedules = await prisma.class_schedules.findMany({ orderBy: { schedule_date: 'asc' } });
        res.json(schedules);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateClassSchedule = async (req, res) => {
    try {
        const { session_title, title, zoom_link, schedule_date, start_time, end_time } = req.body;
        const data = {};
        
        const resolvedTitle = session_title !== undefined ? session_title : title;
        if (resolvedTitle !== undefined) data.session_title = resolvedTitle;
        if (zoom_link !== undefined) data.zoom_link = zoom_link;
        if (schedule_date !== undefined) data.schedule_date = schedule_date ? new Date(schedule_date) : null;
        if (start_time !== undefined) data.start_time = parseTime(start_time);
        if (end_time !== undefined) data.end_time = parseTime(end_time);

        const updated = await prisma.class_schedules.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteClassSchedule = async (req, res) => {
    try {
        await prisma.class_schedules.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getStudentSchedules = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const student = await prisma.students.findUnique({ where: { student_id } });
        if (!student?.class_id) return res.json([]);
        const schedules = await prisma.class_schedules.findMany({
            where: { class_id: student.class_id },
            orderBy: { schedule_date: 'asc' }
        });
        res.json(schedules);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

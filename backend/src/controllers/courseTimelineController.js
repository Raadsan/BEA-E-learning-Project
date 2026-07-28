import prisma from '../lib/prisma.js';

const CourseTimelineController = {
    async getTimelines(req, res) {
        try {
            let timelines = await prisma.course_timeline.findMany({
                where: { is_active: true },
                orderBy: { display_order: 'asc' }
            });
            const classId = req.query.class_id ? Number(req.query.class_id) : null;
            const subprogramId = req.query.subprogram_id ? Number(req.query.subprogram_id) : null;
            if (classId || subprogramId) {
                timelines = timelines.filter((timeline) => {
                    const classIds = Array.isArray(timeline.class_ids) ? timeline.class_ids.map(Number) : [];
                    const subprogramIds = Array.isArray(timeline.subprogram_ids) ? timeline.subprogram_ids.map(Number) : [];
                    const isGlobal = classIds.length === 0 && subprogramIds.length === 0;
                    return isGlobal ||
                        (classId && classIds.includes(classId)) ||
                        (subprogramId && subprogramIds.includes(subprogramId));
                });
            }
            res.json(timelines);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getTimelinesAdmin(req, res) {
        try {
            const timelines = await prisma.course_timeline.findMany({
                orderBy: { display_order: 'asc' }
            });
            res.json(timelines);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async createTimeline(req, res) {
        try {
            const { term_serial, start_date, end_date, holidays, class_ids, subprogram_ids } = req.body;
            
            const maxOrder = await prisma.course_timeline.aggregate({ _max: { display_order: true } });
            const nextOrder = (maxOrder._max.display_order || 0) + 1;

            const timeline = await prisma.course_timeline.create({
                data: {
                    term_serial,
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    holidays,
                    class_ids: Array.isArray(class_ids) ? class_ids.map(Number).filter(Boolean) : [],
                    subprogram_ids: Array.isArray(subprogram_ids) ? subprogram_ids.map(Number).filter(Boolean) : [],
                    display_order: nextOrder
                }
            });
            res.status(201).json(timeline);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateTimeline(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            if (data.start_date) data.start_date = new Date(data.start_date);
            if (data.end_date) data.end_date = new Date(data.end_date);
            if (data.class_ids !== undefined) data.class_ids = Array.isArray(data.class_ids) ? data.class_ids.map(Number).filter(Boolean) : [];
            if (data.subprogram_ids !== undefined) data.subprogram_ids = Array.isArray(data.subprogram_ids) ? data.subprogram_ids.map(Number).filter(Boolean) : [];

            const updated = await prisma.course_timeline.update({
                where: { id: parseInt(id) },
                data
            });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteTimeline(req, res) {
        try {
            await prisma.course_timeline.delete({ where: { id: parseInt(req.params.id) } });
            res.json({ message: "Deleted" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

export default CourseTimelineController;

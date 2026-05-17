import prisma from '../lib/prisma.js';

export const getTimetable = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        const timetable = await prisma.timetables.findMany({
            where: { subprogram_id: parseInt(subprogramId) },
            include: { teachers: { select: { full_name: true } } },
            orderBy: [{ day: 'asc' }, { start_time: 'asc' }]
        });
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createEntry = async (req, res) => {
    try {
        const data = {
            ...req.body,
            program_id: parseInt(req.body.program_id),
            subprogram_id: parseInt(req.body.subprogram_id),
            teacher_id: req.body.teacher_id ? parseInt(req.body.teacher_id) : null,
            date: req.body.date ? new Date(req.body.date) : null,
            start_time: req.body.start_time ? new Date(`1970-01-01T${req.body.start_time}`) : null,
            end_time: req.body.end_time ? new Date(`1970-01-01T${req.body.end_time}`) : null
        };
        if (req.body.year) {
            data.year = parseInt(req.body.year);
        }
        if (req.body.week_number) {
            data.week_number = parseInt(req.body.week_number);
        }

        const entry = await prisma.timetables.create({
            data
        });
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateEntry = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.date) data.date = new Date(data.date);
        if (data.start_time) data.start_time = new Date(`1970-01-01T${data.start_time}`);
        if (data.end_time) data.end_time = new Date(`1970-01-01T${data.end_time}`);
        if (data.year) data.year = parseInt(data.year);
        if (data.program_id) data.program_id = parseInt(data.program_id);
        if (data.subprogram_id) data.subprogram_id = parseInt(data.subprogram_id);
        if (data.teacher_id) data.teacher_id = parseInt(data.teacher_id);
        if (data.week_number) data.week_number = parseInt(data.week_number);

        const updated = await prisma.timetables.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteEntry = async (req, res) => {
    try {
        await prisma.timetables.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// WEEKLY METHODS
export const getWeeklySchedule = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        const { month, year } = req.query;
        const where = { 
            subprogram_id: parseInt(subprogramId),
            week_number: { not: null }
        };
        if (month) where.month = month;
        if (year) where.year = parseInt(year);

        const schedule = await prisma.timetables.findMany({
            where,
            orderBy: { week_number: 'asc' }
        });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createWeeklyEntry = async (req, res) => {
    try {
        const data = {
            ...req.body,
            program_id: parseInt(req.body.program_id),
            subprogram_id: parseInt(req.body.subprogram_id),
            week_number: parseInt(req.body.week_number)
        };
        if (req.body.year) {
            data.year = parseInt(req.body.year);
        }

        const entry = await prisma.timetables.create({
            data
        });
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteWeeklyEntry = async (req, res) => {
    try {
        await prisma.timetables.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const bulkCreateWeeklyEntries = async (req, res) => {
    try {
        const { entries } = req.body;
        const result = await prisma.timetables.createMany({
            data: entries.map(e => {
                const item = {
                    ...e,
                    program_id: parseInt(e.program_id),
                    subprogram_id: parseInt(e.subprogram_id),
                    week_number: parseInt(e.week_number)
                };
                if (e.year) {
                    item.year = parseInt(e.year);
                }
                return item;
            })
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

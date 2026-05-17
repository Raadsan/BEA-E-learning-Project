import prisma from '../lib/prisma.js';

export const getCalendar = async (req, res) => {
    try {
        const calendar = await prisma.academic_calendar.findMany({
            where: { subprogram_id: parseInt(req.params.subprogramId) },
            orderBy: [{ week_number: 'asc' }, { day_of_week: 'asc' }]
        });
        res.json(calendar);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createEntry = async (req, res) => {
    try {
        const { program_id, subprogram_id, week_number, day_of_week, activity_type, activity_title, activity_description } = req.body;
        if (!program_id || !subprogram_id || !week_number || !day_of_week || !activity_type || !activity_title) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }
        const entry = await prisma.academic_calendar.create({
            data: { program_id: parseInt(program_id), subprogram_id: parseInt(subprogram_id), week_number: parseInt(week_number), day_of_week, activity_type, activity_title, activity_description: activity_description || null }
        });
        res.status(201).json(entry);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateEntry = async (req, res) => {
    try {
        const updated = await prisma.academic_calendar.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteEntry = async (req, res) => {
    try {
        await prisma.academic_calendar.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const bulkCreate = async (req, res) => {
    try {
        const { entries } = req.body;
        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: 'Entries array required' });
        }
        const result = await prisma.academic_calendar.createMany({
            data: entries.map(e => ({
                ...e,
                program_id: parseInt(e.program_id),
                subprogram_id: parseInt(e.subprogram_id),
                week_number: parseInt(e.week_number)
            }))
        });
        res.status(201).json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteAllBySubprogram = async (req, res) => {
    try {
        const result = await prisma.academic_calendar.deleteMany({
            where: { subprogram_id: parseInt(req.params.subprogramId) }
        });
        res.json({ message: 'Deleted', count: result.count });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

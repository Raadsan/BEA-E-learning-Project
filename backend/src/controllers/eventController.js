import prisma from '../lib/prisma.js';

export const getEvents = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        const { start, end } = req.query;

        const events = await prisma.timetable_events.findMany({
            where: {
                subprogram_id: parseInt(subprogramId),
                event_date: {
                    gte: new Date(start),
                    lte: new Date(end)
                }
            },
            orderBy: { event_date: 'asc' }
        });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { subprogram_id, event_date, type, title, description } = req.body;
        const event = await prisma.timetable_events.create({
            data: {
                subprogram_id: parseInt(subprogram_id),
                event_date: new Date(event_date),
                type, title, description
            }
        });
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (data.event_date) data.event_date = new Date(data.event_date);

        const updated = await prisma.timetable_events.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        await prisma.timetable_events.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

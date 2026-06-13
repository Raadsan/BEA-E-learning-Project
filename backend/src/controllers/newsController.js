import prisma from '../lib/prisma.js';

const pickNewsFields = (body) => {
    const { title, description, event_date, type, status, image_url, location } = body;
    const data = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (type !== undefined) data.type = type || 'news';
    if (status !== undefined) data.status = status || 'active';
    if (image_url !== undefined) data.image_url = image_url || null;
    if (location !== undefined) data.location = location || null;
    if (event_date) data.event_date = new Date(event_date);

    return data;
};

export const getNews = async (req, res) => {
    try {
        const showAll = req.query.all === 'true';
        const where = showAll ? {} : { status: 'active' };
        const news = await prisma.news_events.findMany({ where, orderBy: { event_date: 'desc' } });
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createNews = async (req, res) => {
    try {
        const { title, event_date } = req.body;
        if (!title || !event_date) {
            return res.status(400).json({ error: 'Title and date/time are required' });
        }

        const news = await prisma.news_events.create({
            data: pickNewsFields(req.body)
        });
        res.status(201).json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateNews = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const updated = await prisma.news_events.update({
            where: { id },
            data: pickNewsFields(req.body)
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteNews = async (req, res) => {
    try {
        await prisma.news_events.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

import prisma from '../lib/prisma.js';

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
        const { title, description, event_date, type, status } = req.body;
        if (!title || !event_date) return res.status(400).json({ error: 'Title and event date required' });
        const news = await prisma.news_events.create({
            data: { title, description, event_date: new Date(event_date), type: type || 'news', status: status || 'active' }
        });
        res.status(201).json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateNews = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.event_date) data.event_date = new Date(data.event_date);
        const updated = await prisma.news_events.update({ where: { id: parseInt(req.params.id) }, data });
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

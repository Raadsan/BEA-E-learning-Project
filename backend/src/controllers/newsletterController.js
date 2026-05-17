import prisma from '../lib/prisma.js';

export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const existing = await prisma.newsletters.findUnique({ where: { email } });
        if (existing) return res.json({ success: true, message: 'Already subscribed!' });

        const sub = await prisma.newsletters.create({ data: { email } });
        res.status(201).json({ success: true, message: 'Subscribed successfully!', data: sub });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await prisma.newsletters.findMany({ orderBy: { created_at: 'desc' } });
        res.json({ success: true, subscribers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteSubscriber = async (req, res) => {
    try {
        await prisma.newsletters.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

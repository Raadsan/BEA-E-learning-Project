import prisma from '../lib/prisma.js';

const pickTutorialFields = (body) => {
    const { title, description, media_type, media_url, status } = body;
    const data = {};

    if (title !== undefined) data.title = String(title).trim();
    if (description !== undefined) data.description = description || null;
    if (media_type !== undefined) {
        const allowedTypes = ['video', 'audio', 'image', 'document'];
        data.media_type = allowedTypes.includes(media_type) ? media_type : 'video';
    }
    if (media_url !== undefined) data.media_url = media_url || null;
    if (status !== undefined) data.status = status === 'inactive' ? 'inactive' : 'active';

    return data;
};

export const getTutorials = async (req, res) => {
    try {
        const showAll = req.query.all === 'true';
        const where = showAll ? {} : { status: 'active' };
        const tutorials = await prisma.tutorials.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });
        res.json(tutorials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTutorialById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const tutorial = await prisma.tutorials.findUnique({ where: { id } });
        if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });
        res.json(tutorial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createTutorial = async (req, res) => {
    try {
        const { title, media_url } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!media_url) {
            return res.status(400).json({ error: 'Please upload a video, audio, image, or document file' });
        }

        const tutorial = await prisma.tutorials.create({
            data: {
                ...pickTutorialFields(req.body),
                created_by: req.user?.userId ? parseInt(req.user.userId, 10) || null : null,
            },
        });
        res.status(201).json(tutorial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateTutorial = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const updated = await prisma.tutorials.update({
            where: { id },
            data: pickTutorialFields(req.body),
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTutorial = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prisma.tutorials.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

import prisma from '../lib/prisma.js';

const VALID_TYPES = new Set(['teacher', 'student']);

export const resolveReviewWindowState = (window, now = new Date()) => {
    if (!window) {
        return { is_open: false, effective_status: 'inactive', reason: 'not_configured' };
    }

    if (window.status !== 'active') {
        return { is_open: false, effective_status: 'inactive', reason: 'admin_inactive' };
    }

    const current = now instanceof Date ? now : new Date(now);
    if (window.start_date && current < new Date(window.start_date)) {
        return { is_open: false, effective_status: 'upcoming', reason: 'before_start' };
    }
    if (window.end_date && current > new Date(window.end_date)) {
        return { is_open: false, effective_status: 'closed', reason: 'after_end' };
    }

    return { is_open: true, effective_status: 'active', reason: 'open' };
};

const ensureReviewWindow = async (review_type) => {
    const existing = await prisma.review_windows.findUnique({ where: { review_type } });
    if (existing) return existing;
    return prisma.review_windows.create({
        data: { review_type, status: 'inactive' },
    });
};

export const assertReviewWindowOpen = async (review_type) => {
    if (!VALID_TYPES.has(review_type)) {
        const error = new Error('Invalid review type');
        error.statusCode = 400;
        throw error;
    }
    const window = await ensureReviewWindow(review_type);
    const state = resolveReviewWindowState(window);
    if (!state.is_open) {
        const error = new Error('Review period is not open. Please contact the administrator.');
        error.statusCode = 403;
        error.windowState = state;
        throw error;
    }
    return state;
};

export const getReviewWindow = async (req, res) => {
    try {
        const { type } = req.params;
        if (!VALID_TYPES.has(type)) {
            return res.status(400).json({ error: 'Invalid review type' });
        }
        const window = await ensureReviewWindow(type);
        const state = resolveReviewWindowState(window);
        res.json({ ...window, ...state });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllReviewWindows = async (req, res) => {
    try {
        await Promise.all([ensureReviewWindow('teacher'), ensureReviewWindow('student')]);
        const windows = await prisma.review_windows.findMany({ orderBy: { review_type: 'asc' } });
        const mapped = windows.map((window) => ({
            ...window,
            ...resolveReviewWindowState(window),
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateReviewWindow = async (req, res) => {
    try {
        const { type } = req.params;
        if (!VALID_TYPES.has(type)) {
            return res.status(400).json({ error: 'Invalid review type' });
        }

        const { status, start_date, end_date } = req.body;
        if (status && !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Status must be active or inactive' });
        }

        await ensureReviewWindow(type);
        const updated = await prisma.review_windows.update({
            where: { review_type: type },
            data: {
                status: status || undefined,
                start_date: start_date === null || start_date === '' ? null : start_date ? new Date(start_date) : undefined,
                end_date: end_date === null || end_date === '' ? null : end_date ? new Date(end_date) : undefined,
                updated_by: req.user?.userId ? parseInt(req.user.userId, 10) || null : null,
            },
        });

        res.json({ ...updated, ...resolveReviewWindowState(updated) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

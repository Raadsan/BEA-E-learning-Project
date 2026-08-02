import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

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
            end_time: req.body.end_time ? new Date(`1970-01-01T${req.body.end_time}`) : null,
            day: req.body.day || req.body.day_of_week
        };
        if (req.body.year) {
            data.year = parseInt(req.body.year);
        }
        if (req.body.week_number) {
            data.week_number = parseInt(req.body.week_number);
        }
        delete data.day_of_week;

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
        if (data.day_of_week || data.day) {
            data.day = data.day || data.day_of_week;
        }
        delete data.day_of_week;

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
            week_number: parseInt(req.body.week_number),
            day: req.body.day || req.body.day_of_week
        };
        if (req.body.year) {
            data.year = parseInt(req.body.year);
        }
        delete data.day_of_week;

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
                    week_number: parseInt(e.week_number),
                    day: e.day || e.day_of_week
                };
                if (e.year) {
                    item.year = parseInt(e.year);
                }
                delete item.day_of_week;
                return item;
            })
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const normalizeTimelineIds = (value) => Array.isArray(value)
    ? [...new Set(value.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
    : [];

const timelineRange = (startValue, endValue) => {
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (!startValue || !endValue || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { error: 'Valid From and To dates are required.' };
    if (end < start) return { error: 'To date cannot be earlier than From date.' };
    return { start, end };
};

export const getTimelineRanges = async (_req, res) => {
    try {
        const rows = await prisma.timetables.findMany({
            where: { timeline_group_id: { not: null }, type: 'Timeline' },
            include: { subprograms: { select: { id: true, subprogram_name: true } }, programs: { select: { id: true, title: true } } },
            orderBy: [{ date: 'desc' }, { created_at: 'desc' }],
        });
        const groups = new Map();
        for (const row of rows) {
            const key = row.timeline_group_id;
            if (!groups.has(key)) groups.set(key, { ...row, subprogram_ids: [], subprograms: [], program_ids: [] });
            const group = groups.get(key);
            group.subprogram_ids.push(row.subprogram_id);
            group.subprograms.push(row.subprograms);
            if (!group.program_ids.includes(row.program_id)) group.program_ids.push(row.program_id);
        }
        res.json([...groups.values()]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createTimelineRange = async (req, res) => {
    try {
        const { activity_title, activity_description, start_date, end_date } = req.body;
        const subprogramIds = normalizeTimelineIds(req.body.subprogram_ids);
        const range = timelineRange(start_date, end_date);
        if (!String(activity_title || '').trim()) return res.status(400).json({ error: 'Timeline title is required.' });
        if (range.error) return res.status(400).json({ error: range.error });
        if (!subprogramIds.length) return res.status(400).json({ error: 'Select at least one subprogram.' });
        const subprograms = await prisma.subprograms.findMany({ where: { id: { in: subprogramIds } }, select: { id: true, program_id: true } });
        if (subprograms.length !== subprogramIds.length) return res.status(400).json({ error: 'One or more selected subprograms are invalid.' });
        const groupId = randomUUID();
        await prisma.timetables.createMany({ data: subprograms.map((item) => ({
            program_id: item.program_id, subprogram_id: item.id, date: range.start, end_date: range.end,
            timeline_group_id: groupId, day: range.start.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
            activity_title: String(activity_title).trim(), activity_description: activity_description || null,
            activity_type: 'Academic Timeline', type: 'Timeline', month: range.start.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year: range.start.getUTCFullYear(),
        })) });
        res.status(201).json({ message: 'Academic timeline created.', timeline_group_id: groupId });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateTimelineRange = async (req, res) => {
    try {
        const groupId = String(req.params.groupId || '');
        const existing = await prisma.timetables.findFirst({ where: { timeline_group_id: groupId } });
        if (!existing) return res.status(404).json({ error: 'Academic timeline not found.' });
        const subprogramIds = normalizeTimelineIds(req.body.subprogram_ids);
        const range = timelineRange(req.body.start_date, req.body.end_date);
        if (!String(req.body.activity_title || '').trim()) return res.status(400).json({ error: 'Timeline title is required.' });
        if (range.error) return res.status(400).json({ error: range.error });
        if (!subprogramIds.length) return res.status(400).json({ error: 'Select at least one subprogram.' });
        const subprograms = await prisma.subprograms.findMany({ where: { id: { in: subprogramIds } }, select: { id: true, program_id: true } });
        await prisma.$transaction([
            prisma.timetables.deleteMany({ where: { timeline_group_id: groupId, type: 'Timeline' } }),
            prisma.timetables.deleteMany({ where: { timeline_group_id: groupId, type: 'Timeline Activity', subprogram_id: { notIn: subprogramIds } } }),
            prisma.timetables.createMany({ data: subprograms.map((item) => ({ program_id: item.program_id, subprogram_id: item.id, date: range.start, end_date: range.end, timeline_group_id: groupId, day: range.start.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }), activity_title: String(req.body.activity_title).trim(), activity_description: req.body.activity_description || null, activity_type: 'Academic Timeline', type: 'Timeline', month: range.start.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year: range.start.getUTCFullYear() })) }),
        ]);
        res.json({ message: 'Academic timeline updated.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteTimelineRange = async (req, res) => {
    try {
        const result = await prisma.timetables.deleteMany({ where: { timeline_group_id: String(req.params.groupId || '') } });
        if (!result.count) return res.status(404).json({ error: 'Academic timeline not found.' });
        res.json({ message: 'Academic timeline deleted.', count: result.count });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
export const getTimelineActivities = async (req, res) => {
    try {
        const rows = await prisma.timetables.findMany({
            where: { timeline_group_id: String(req.params.groupId), subprogram_id: parseInt(req.params.subprogramId), type: 'Timeline Activity' },
            orderBy: [{ week_number: 'asc' }, { day: 'asc' }],
        });
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createTimelineActivity = async (req, res) => {
    try {
        const { timeline_group_id, week_number, day, activity_title, activity_description } = req.body;
        if (!timeline_group_id || !week_number || !day || !String(activity_title || '').trim()) return res.status(400).json({ error: 'Timeline, week, day, and activity title are required.' });
        const ranges = await prisma.timetables.findMany({ where: { timeline_group_id: String(timeline_group_id), type: 'Timeline' } });
        if (!ranges.length) return res.status(404).json({ error: 'Academic timeline not found.' });
        const existing = await prisma.timetables.findFirst({ where: { timeline_group_id: String(timeline_group_id), week_number: parseInt(week_number), day, type: 'Timeline Activity' } });
        if (existing) return res.status(409).json({ error: 'This day already has an activity. Edit the existing activity instead.' });
        await prisma.timetables.createMany({ data: ranges.map((range) => ({ program_id: range.program_id, subprogram_id: range.subprogram_id, timeline_group_id: String(timeline_group_id), date: range.date, end_date: range.end_date, day, week_number: parseInt(week_number), activity_title: String(activity_title).trim(), activity_description: activity_description || null, activity_type: 'Academic Activity', type: 'Timeline Activity', month: range.month, year: range.year })) });
        res.status(201).json({ message: `Activity assigned to ${ranges.length} subprograms.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateTimelineActivity = async (req, res) => {
    try {
        const existing = await prisma.timetables.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!existing) return res.status(404).json({ error: 'Activity not found.' });
        const result = await prisma.timetables.updateMany({ where: { timeline_group_id: existing.timeline_group_id, week_number: existing.week_number, day: existing.day, type: 'Timeline Activity' }, data: { activity_title: String(req.body.activity_title || '').trim(), activity_description: req.body.activity_description || null } });
        res.json({ message: 'Activity updated for all assigned subprograms.', count: result.count });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteTimelineActivity = async (req, res) => {
    try {
        const existing = await prisma.timetables.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!existing) return res.status(404).json({ error: 'Activity not found.' });
        const result = await prisma.timetables.deleteMany({ where: { timeline_group_id: existing.timeline_group_id, week_number: existing.week_number, day: existing.day, type: 'Timeline Activity' } });
        res.json({ message: 'Activity deleted from all assigned subprograms.', count: result.count });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
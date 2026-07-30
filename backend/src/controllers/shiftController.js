import prisma from '../lib/prisma.js';

// MySQL TIME is a wall-clock value, not an instant in a timezone.  Always
// construct it in UTC so the Node process timezone cannot move it by hours.
const timeToUtcDate = (value) => {
    const match = String(value || '').match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;
    const [, hours, minutes, seconds = '00'] = match;
    return new Date(`1970-01-01T${hours}:${minutes}:${seconds}.000Z`);
};

// Return a time-only value to the browser.  Sending DateTime ISO values makes
// a <input type="time"> depend on the browser/server timezone.
const serializeShift = (shift) => ({
    ...shift,
    start_time: shift.start_time ? shift.start_time.toISOString().slice(11, 16) : null,
    end_time: shift.end_time ? shift.end_time.toISOString().slice(11, 16) : null,
});

export const createShift = async (req, res) => {
    try {
        const { shift_name, session_type, start_time, end_time } = req.body;
        if (!shift_name || !session_type || !start_time || !end_time) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const shift = await prisma.shifts.create({
            data: {
                shift_name,
                session_type,
                start_time: timeToUtcDate(start_time),
                end_time: timeToUtcDate(end_time)
            }
        });
        res.status(201).json(serializeShift(shift));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getShifts = async (req, res) => {
    try {
        const shifts = await prisma.shifts.findMany();
        res.json(shifts.map(serializeShift));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getShift = async (req, res) => {
    try {
        const shift = await prisma.shifts.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!shift) return res.status(404).json({ error: "Not found" });
        res.json(serializeShift(shift));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (data.start_time) data.start_time = timeToUtcDate(data.start_time);
        if (data.end_time) data.end_time = timeToUtcDate(data.end_time);

        const updated = await prisma.shifts.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(serializeShift(updated));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteShift = async (req, res) => {
    try {
        await prisma.shifts.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

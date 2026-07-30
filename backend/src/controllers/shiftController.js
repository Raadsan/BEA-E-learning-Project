import prisma from '../lib/prisma.js';

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
                start_time: new Date(`1970-01-01T${start_time}`),
                end_time: new Date(`1970-01-01T${end_time}`)
            }
        });
        res.status(201).json(shift);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getShifts = async (req, res) => {
    try {
        const shifts = await prisma.shifts.findMany();
        res.json(shifts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getShift = async (req, res) => {
    try {
        const shift = await prisma.shifts.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!shift) return res.status(404).json({ error: "Not found" });
        res.json(shift);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (data.start_time) data.start_time = new Date(`1970-01-01T${data.start_time}`);
        if (data.end_time) data.end_time = new Date(`1970-01-01T${data.end_time}`);

        const updated = await prisma.shifts.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(updated);
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

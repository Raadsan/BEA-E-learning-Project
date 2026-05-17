import prisma from '../lib/prisma.js';

export const getCourses = async (req, res) => {
    try {
        const courses = await prisma.courses.findMany();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCourse = async (req, res) => {
    try {
        const course = await prisma.courses.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!course) return res.status(404).json({ error: "Not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createCourse = async (req, res) => {
    try {
        const course = await prisma.courses.create({ data: req.body });
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const updated = await prisma.courses.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        await prisma.courses.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

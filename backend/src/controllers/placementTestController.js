import prisma from '../lib/prisma.js';

export const createPlacementTest = async (req, res) => {
    try {
        const test = await prisma.placement_tests.create({ data: req.body });
        res.status(201).json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPlacementTests = async (req, res) => {
    try {
        const tests = await prisma.placement_tests.findMany();
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPlacementTestById = async (req, res) => {
    try {
        const test = await prisma.placement_tests.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!test) return res.status(404).json({ error: "Not found" });
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const submitPlacementTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;
        const test = await prisma.placement_tests.findUnique({ where: { id: parseInt(test_id) } });
        if (!test) return res.status(404).json({ error: "Test not found" });

        const questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        let score = 0;
        let total_questions = 0;
        let hasEssay = false;

        questions.forEach(q => {
            if (q.type === 'mcq') {
                total_questions++;
                if (answers[q.id] === q.options[q.correctOption]) score++;
            } else if (q.type === 'essay') {
                hasEssay = true;
            }
        });

        const percentage = total_questions > 0 ? (score / total_questions) * 100 : 0;
        const result = await prisma.placement_test_results.create({
            data: {
                test_id: parseInt(test_id),
                student_id,
                score,
                total_questions,
                percentage,
                answers: JSON.stringify(answers),
                status: hasEssay ? 'pending' : 'completed'
            }
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPlacementResults = async (req, res) => {
    try {
        const results = await prisma.placement_test_results.findMany({
            orderBy: { submitted_at: 'desc' }
        });

        const populated = await Promise.all(results.map(async (result) => {
            let student_name = '-';
            let expiry_date = null;
            let is_extended = false;
            let approval_status = null;
            let class_id = null;
            if (result.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: result.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    expiry_date = student.expiry_date;
                    is_extended = student.is_extended;
                    approval_status = student.approval_status;
                    class_id = student.class_id;
                }
            }
            return {
                ...result,
                student_name,
                expiry_date,
                is_extended,
                approval_status,
                class_id
            };
        }));

        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

export const updatePlacementTest = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Invalid placement test ID" });
        }

        const existing = await prisma.placement_tests.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Placement test not found" });
        }

        const { title, description, duration_minutes, questions, status } = req.body;
        const updated = await prisma.placement_tests.update({
            where: { id },
            data: {
                title,
                description,
                duration_minutes:
                    duration_minutes === undefined || duration_minutes === null
                        ? undefined
                        : Number(duration_minutes),
                questions,
                status,
            },
        });

        res.json(updated);
    } catch (err) {
        console.error("Update placement test error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const deletePlacementTest = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Invalid placement test ID" });
        }

        const existing = await prisma.placement_tests.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Placement test not found" });
        }

        await prisma.$transaction([
            prisma.placement_test_results.deleteMany({ where: { test_id: id } }),
            prisma.placement_tests.delete({ where: { id } }),
        ]);

        res.json({ message: "Placement test deleted successfully" });
    } catch (err) {
        console.error("Delete placement test error:", err);
        res.status(500).json({ error: err.message });
    }
};

const scorePlacementAnswers = (questions, answers) => {
    let score = 0;
    let total_questions = 0;
    let hasEssay = false;

    const list = Array.isArray(questions) ? questions : [];

    list.forEach((q) => {
        if (q.type === "mcq" || q.type === "multiple_choice") {
            total_questions++;
            const correct = q.options?.[q.correctOption];
            if (answers[q.id] === correct) score++;
        } else if (q.type === "essay") {
            hasEssay = true;
        } else if (q.type === "passage" && Array.isArray(q.subQuestions)) {
            q.subQuestions.forEach((sq) => {
                if (sq.type === "essay") {
                    hasEssay = true;
                } else if (sq.options && sq.correctOption !== undefined) {
                    total_questions++;
                    const correct = sq.options[sq.correctOption];
                    if (answers[sq.id] === correct) score++;
                }
            });
        }
    });

    const percentage = total_questions > 0 ? (score / total_questions) * 100 : 0;
    return { score, total_questions, percentage, hasEssay };
};

export const submitPlacementTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;

        if (!test_id || !student_id || !answers) {
            return res.status(400).json({ error: "test_id, student_id, and answers are required" });
        }

        const test = await prisma.placement_tests.findUnique({ where: { id: parseInt(test_id) } });
        if (!test) return res.status(404).json({ error: "Test not found" });

        const existing = await prisma.placement_test_results.findFirst({
            where: { test_id: parseInt(test_id), student_id: String(student_id) },
        });
        if (existing) {
            return res.status(400).json({ error: "You have already submitted this placement test", result: existing });
        }

        const questions = typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
        const { score, total_questions, percentage, hasEssay } = scorePlacementAnswers(questions, answers);

        const result = await prisma.placement_test_results.create({
            data: {
                test_id: parseInt(test_id),
                student_id: String(student_id),
                score,
                total_questions,
                percentage,
                answers,
                status: hasEssay ? "pending_review" : "completed",
            },
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("❌ Submit placement test error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getStudentPlacementResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const results = await prisma.placement_test_results.findMany({
            where: { student_id: studentId },
            orderBy: { submitted_at: "desc" },
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const gradePlacementTest = async (req, res) => {
    try {
        const resultId = parseInt(req.params.resultId);
        const { essay_marks, oral_review_marks, feedback_file, recommended_level, status } = req.body;

        const updated = await prisma.placement_test_results.update({
            where: { id: resultId },
            data: {
                essay_marks: essay_marks ? JSON.stringify(essay_marks) : undefined,
                oral_review_marks: oral_review_marks !== undefined && oral_review_marks !== "" ? parseFloat(oral_review_marks) : undefined,
                feedback_file: feedback_file || undefined,
                recommended_level: recommended_level || undefined,
                status: status || "completed",
            },
        });
        res.json(updated);
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

import prisma from '../lib/prisma.js';

export const createProficiencyTest = async (req, res) => {
    try {
        const test = await prisma.proficiency_tests.create({ data: req.body });
        res.status(201).json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProficiencyTests = async (req, res) => {
    try {
        const tests = await prisma.proficiency_tests.findMany();
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProficiencyTestById = async (req, res) => {
    try {
        const test = await prisma.proficiency_tests.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!test) return res.status(404).json({ error: "Not found" });
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProficiencyTest = async (req, res) => {
    try {
        const updated = await prisma.proficiency_tests.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProficiencyTest = async (req, res) => {
    try {
        await prisma.proficiency_tests.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const submitProficiencyTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;
        const test = await prisma.proficiency_tests.findUnique({ where: { id: parseInt(test_id) } });
        if (!test) return res.status(404).json({ error: "Test not found" });

        const questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        let score = 0;
        let total_points = 0;
        let hasEssay = false;

        questions.forEach(q => {
            if (q.type === 'mcq' || q.type === 'multiple_choice') {
                total_points += (q.points || 1);
                if (answers[q.id] === q.options[q.correctOption]) score += (q.points || 1);
            } else if (q.type === 'essay') {
                hasEssay = true;
                total_points += (q.points || 0);
            }
        });

        const result = await prisma.proficiency_test_results.create({
            data: {
                test_id: parseInt(test_id),
                student_id,
                answers: JSON.stringify(answers),
                score: score,
                total_points: total_points,
                status: hasEssay ? 'pending' : 'completed'
            }
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProficiencyResults = async (req, res) => {
    try {
        const results = await prisma.proficiency_test_results.findMany({
            include: { proficiency_tests: true },
            orderBy: { submitted_at: 'desc' }
        });

        const populated = await Promise.all(results.map(async (result) => {
            let student_name = 'Unknown Student';
            let expiry_date = null;
            let is_extended = false;
            let status_val = null;
            let class_id = null;
            let is_candidate = false;
            if (result.student_id) {
                // Try ProficiencyTestStudents first
                const profStudent = await prisma.ProficiencyTestStudents.findUnique({
                    where: { student_id: result.student_id }
                });
                if (profStudent) {
                    student_name = `${profStudent.first_name || ''} ${profStudent.last_name || ''}`.trim() || 'Unknown Student';
                    expiry_date = profStudent.expiry_date;
                    is_extended = profStudent.is_extended;
                    status_val = profStudent.status;
                    is_candidate = true;
                } else {
                    // Try regular students
                    const regularStudent = await prisma.students.findUnique({
                        where: { student_id: result.student_id }
                    });
                    if (regularStudent) {
                        student_name = regularStudent.full_name || 'Unknown Student';
                        expiry_date = regularStudent.expiry_date;
                        is_extended = regularStudent.is_extended;
                        status_val = regularStudent.approval_status;
                        class_id = regularStudent.class_id;
                        is_candidate = false;
                    }
                }
            }

            // Calculate percentage dynamically
            const scoreNum = result.score ? parseFloat(result.score.toString()) : 0;
            const totalPoints = result.total_points || 0;
            const percentage = totalPoints > 0 ? (scoreNum / totalPoints) * 100 : 0;

            return {
                ...result,
                student_name,
                percentage,
                expiry_date,
                is_extended,
                status_val,
                class_id,
                is_candidate
            };
        }));

        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const gradeProficiencyTest = async (req, res) => {
    try {
        const { resultId } = req.params;
        const { essayMarks, oralReviewMarks } = req.body;

        const result = await prisma.proficiency_test_results.findUnique({ where: { id: parseInt(resultId) } });
        if (!result) return res.status(404).json({ error: "Not found" });

        const newScore = (result.score || 0) + (parseFloat(essayMarks) || 0) + (parseFloat(oralReviewMarks) || 0);

        const updated = await prisma.proficiency_test_results.update({
            where: { id: parseInt(resultId) },
            data: {
                score: newScore,
                essay_marks: essayMarks ? JSON.stringify(essayMarks) : undefined,
                oral_review_marks: oralReviewMarks ? parseFloat(oralReviewMarks) : undefined,
                status: 'completed'
            }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

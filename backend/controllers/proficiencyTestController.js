import * as ProficiencyTest from "../models/proficiencyTestModel.js";
import * as Student from "../models/studentModel.js";

export const createProficiencyTest = async (req, res) => {
    try {
        const test = await ProficiencyTest.createProficiencyTest(req.body);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllProficiencyTests = async (req, res) => {
    try {
        const tests = await ProficiencyTest.getAllProficiencyTests();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProficiencyTestById = async (req, res) => {
    try {
        const test = await ProficiencyTest.getProficiencyTestById(req.params.id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProficiencyTest = async (req, res) => {
    try {
        const test = await ProficiencyTest.updateProficiencyTest(req.params.id, req.body);
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProficiencyTest = async (req, res) => {
    try {
        await ProficiencyTest.deleteProficiencyTest(req.params.id);
        res.status(200).json({ message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const submitProficiencyTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;

        const test = await ProficiencyTest.getProficiencyTestById(test_id);
        if (!test) return res.status(404).json({ error: "Test not found" });

        const existingResults = await ProficiencyTest.getResultsByStudent(student_id);
        const alreadySubmitted = existingResults.find(r => r.test_id === parseInt(test_id));
        if (alreadySubmitted) {
            return res.status(400).json({ error: "You have already submitted this proficiency test." });
        }

        const testQuestions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        let score = 0;
        let total_possible_points = 0;
        let hasEssay = false;

        testQuestions.forEach(q => {
            if (q.type === 'passage') {
                (q.subQuestions || []).forEach(subQ => {
                    total_possible_points += (parseInt(subQ.points) || 1);
                    const studentAnswer = answers[subQ.id];
                    const correctAnswer = subQ.options[subQ.correctOption];
                    if (studentAnswer === correctAnswer) {
                        score += (parseInt(subQ.points) || 1);
                    }
                });
            } else if (q.type === 'multiple_choice' || q.type === 'mcq') {
                total_possible_points += (parseInt(q.points) || 1);
                const studentAnswer = answers[q.id];
                const correctAnswer = q.options?.[q.correctOption];
                if (studentAnswer === correctAnswer) {
                    score += (parseInt(q.points) || 1);
                }
            } else if (q.type === 'essay') {
                hasEssay = true;
                total_possible_points += (parseInt(q.points) || 0);
            }
        });

        const percentage = total_possible_points > 0 ? (score / total_possible_points) * 100 : 0;

        // Level logic could be different for IELTS/Professional, but keeping generic for now
        let recommended_level = "Standard";
        if (percentage >= 80) recommended_level = "Advanced";

        // Map status to DB ENUM ('pending', 'graded', 'reviewed')
        let status = 'graded'; // Default to graded if auto-scored (MCQ)
        if (hasEssay) {
            status = 'pending'; // Needs manual review
            recommended_level = null;
        }

        const result = await ProficiencyTest.saveTestResult({
            student_id,
            test_id,
            score,
            total_questions: total_possible_points,
            percentage,
            recommended_level,
            answers,
            status: status
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Submission error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getStudentProficiencyResults = async (req, res) => {
    try {
        const results = await ProficiencyTest.getResultsByStudent(req.params.studentId);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllProficiencyResults = async (req, res) => {
    try {
        const results = await ProficiencyTest.getAllResults();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const gradeProficiencyTest = async (req, res) => {
    try {
        const { resultId } = req.params;
        const { essayMarks, feedbackFile } = req.body;

        const results = await ProficiencyTest.getAllResults();
        const result = results.find(r => r.id === parseInt(resultId));

        if (!result) return res.status(404).json({ error: "Result not found" });

        // Calculate new score: Current MCQ score + Essay Marks
        const newScore = result.score + (parseInt(essayMarks) || 0);

        // Recalculate percentage
        const totalPoints = result.total_points || result.total_questions;
        const percentage = totalPoints > 0 ? (newScore / totalPoints) * 100 : 0;

        // Determine level (Generic logic, can be customized)
        let recommended_level = "Standard";
        if (percentage >= 80) recommended_level = "Advanced";

        // Update DB Result
        // Note: proficiency_test_results table does not have 'percentage' or 'recommended_level' columns
        // We only update score, status, and feedback

        await ProficiencyTest.updateTestResult(resultId, {
            score: newScore,
            status: 'reviewed', // Mark as reviewed after grading
            feedback: feedbackFile
        });

        res.status(200).json({ message: "Grading completed", newScore, recommended_level });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

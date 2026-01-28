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

        const student = await Student.getStudentById(student_id);
        const isProficiencyOnly = student?.chosen_program?.toLowerCase().trim() === 'proficiency test';

        const existingResults = await ProficiencyTest.getResultsByStudent(student_id);
        const alreadySubmitted = existingResults.find(r => r.test_id === parseInt(test_id));

        if (alreadySubmitted && !isProficiencyOnly) {
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
        const { essayMarks, oralReviewMarks, essayFeedbackFile, audioFeedbackFile, feedbackFile } = req.body;

        const results = await ProficiencyTest.getAllResults();
        const result = results.find(r => r.id === parseInt(resultId));

        if (!result) return res.status(404).json({ error: "Result not found" });

        // Fetch the original test to recalculate MCQ/Passage scores correctly (Base Score)
        // This ensures idempotency: We always start from the auto-graded score + new essay marks
        const test = await ProficiencyTest.getProficiencyTestById(result.test_id);
        const questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        const studentAnswers = typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers;
        const parsedEssayMarks = typeof essayMarks === 'object' ? essayMarks : {};
        let totalManualScore = 0;

        questions.forEach(q => {
            // Use manual override if provided
            if (parsedEssayMarks[q.id] !== undefined && parsedEssayMarks[q.id] !== "" && parsedEssayMarks[q.id] !== null) {
                totalManualScore += (parseFloat(parsedEssayMarks[q.id]) || 0);
            } else {
                // Fallback to auto-calculation
                const subqs = q.subQuestions || q.subquestions;
                if (subqs && Array.isArray(subqs) && subqs.length > 0) {
                    subqs.forEach(sq => {
                        if (studentAnswers[sq.id] === sq.options[sq.correctOption]) {
                            totalManualScore += (parseInt(sq.points) || 1);
                        }
                    });
                } else if (q.type === 'mcq' || q.type === 'listening' || q.type === 'multiple_choice') {
                    if (studentAnswers[q.id] === q.options[q.correctOption]) {
                        totalManualScore += (parseInt(q.points) || 1);
                    }
                }
            }
        });

        const oralScore = parseFloat(oralReviewMarks) || 0;
        const newScore = totalManualScore + oralScore;

        // Status logic: Only 'completed' if both essay and oral are graded
        const hasEssay = questions.some(q => q.type === 'essay');
        const isEssayGraded = !hasEssay || (essayMarks !== "" && essayMarks !== null && essayMarks !== undefined);
        const isOralGraded = (oralReviewMarks !== "" && oralReviewMarks !== null && oralReviewMarks !== undefined);

        const status = (isEssayGraded && isOralGraded) ? 'completed' : 'pending';

        await ProficiencyTest.updateTestResult(resultId, {
            score: newScore,
            status: status,
            essay_marks: typeof essayMarks === 'object' ? JSON.stringify(essayMarks) : essayMarks,
            oral_review_marks: oralReviewMarks === "" ? 0 : oralReviewMarks,
            feedback: JSON.stringify({
                essay: essayFeedbackFile || null,
                audio: audioFeedbackFile || null
            })
        });


        res.status(200).json({ message: "Grading updated", newScore, status });
    } catch (error) {
        console.error("❌ Grading error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: error.message || "Grading failed" });
    }
};

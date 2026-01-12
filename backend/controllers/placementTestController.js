import * as PlacementTest from "../models/placementTestModel.js";

export const createPlacementTest = async (req, res) => {
    try {
        const test = await PlacementTest.createPlacementTest(req.body);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllPlacementTests = async (req, res) => {
    try {
        const tests = await PlacementTest.getAllPlacementTests();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPlacementTestById = async (req, res) => {
    try {
        const test = await PlacementTest.getPlacementTestById(req.params.id);
        if (!test) return res.status(404).json({ error: "Test not found" });

        let testQuestions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;

        // Randomize questions if it's a student taking the test (or any request to this endpoint)
        // Fisher-Yates shuffle
        if (testQuestions && Array.isArray(testQuestions)) {
            for (let i = testQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [testQuestions[i], testQuestions[j]] = [testQuestions[j], testQuestions[i]];
            }
        }

        res.status(200).json({ ...test, questions: testQuestions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePlacementTest = async (req, res) => {
    try {
        const test = await PlacementTest.updatePlacementTest(req.params.id, req.body);
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePlacementTest = async (req, res) => {
    try {
        await PlacementTest.deletePlacementTest(req.params.id);
        res.status(200).json({ message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const submitPlacementTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;

        const test = await PlacementTest.getPlacementTestById(test_id);
        if (!test) return res.status(404).json({ error: "Test not found" });

        const existingResults = await PlacementTest.getResultsByStudent(student_id);
        const alreadySubmitted = existingResults.find(r => r.test_id === parseInt(test_id));
        if (alreadySubmitted) {
            return res.status(400).json({ error: "You have already submitted this placement test." });
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
            } else if (q.type === 'mcq') {
                total_possible_points += (parseInt(q.points) || 1);
                const studentAnswer = answers[q.id];
                const correctAnswer = q.options[q.correctOption];
                if (studentAnswer === correctAnswer) {
                    score += (parseInt(q.points) || 1);
                }
            } else if (q.type === 'essay') {
                hasEssay = true;
                total_possible_points += (parseInt(q.points) || 0);
                // Essay logic: for now, we just record the answer. 
            }
        });

        const percentage = total_possible_points > 0 ? (score / total_possible_points) * 100 : 0;

        let recommended_level = "Beginner";
        if (percentage >= 80) recommended_level = "Advanced";
        else if (percentage >= 50) recommended_level = "Intermediate";

        let status = 'completed';
        if (hasEssay) {
            status = 'pending_review';
            recommended_level = null; // Cannot determine level yet
        }

        const result = await PlacementTest.saveTestResult({
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

export const getStudentPlacementResults = async (req, res) => {
    try {
        const results = await PlacementTest.getResultsByStudent(req.params.studentId);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllPlacementResults = async (req, res) => {
    try {
        const results = await PlacementTest.getAllResults();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const gradePlacementTest = async (req, res) => {
    try {
        const { resultId } = req.params;
        const { essayMarks, feedbackFile } = req.body;

        const results = await PlacementTest.getAllResults();
        const result = results.find(r => r.id === parseInt(resultId));

        if (!result) return res.status(404).json({ error: "Result not found" });

        // Calculate new score
        const newScore = result.score + (parseInt(essayMarks) || 0);
        // Recalculate based on total questions (assuming points were already summed correctly during test creation/submission)
        // Wait, total_questions in the DB is actually "total_possible_points". Let's assume that's correct from submission time.
        const percentage = (newScore / result.total_questions) * 100;

        let recommended_level = "Beginner";
        if (percentage >= 80) recommended_level = "Advanced";
        else if (percentage >= 50) recommended_level = "Intermediate";

        // Update DB Result
        await PlacementTest.updateTestResult(resultId, {
            score: newScore,
            percentage,
            recommended_level,
            status: 'completed',
            essay_marks: essayMarks,
            feedback_file: feedbackFile
        });

        res.status(200).json({ message: "Grading completed", newScore, recommended_level });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

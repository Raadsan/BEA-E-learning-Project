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
        const { essayMarks, oralReviewMarks, feedbackFile } = req.body;

        const results = await PlacementTest.getAllResults();
        const result = results.find(r => r.id === parseInt(resultId));

        if (!result) return res.status(404).json({ error: "Result not found" });

        const test = await PlacementTest.getPlacementTestById(result.test_id);
        const testQuestions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        const studentAnswers = typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers;

        const parsedEssayMarks = typeof essayMarks === 'object' ? essayMarks : {};
        let totalManualScore = 0;
        let hasEssay = false;

        testQuestions.forEach(q => {
            if (q.type === 'essay') hasEssay = true;

            // Use manual override if provided
            if (parsedEssayMarks[q.id] !== undefined && parsedEssayMarks[q.id] !== "" && parsedEssayMarks[q.id] !== null) {
                totalManualScore += (parseFloat(parsedEssayMarks[q.id]) || 0);
            } else {
                // Fallback to auto-calculation for non-essay questions
                const subqs = q.subQuestions || q.subquestions;
                if (subqs && Array.isArray(subqs) && subqs.length > 0) {
                    subqs.forEach(sq => {
                        if (studentAnswers[sq.id] === sq.options[sq.correctOption]) {
                            totalManualScore += (parseInt(sq.points) || 1);
                        }
                    });
                } else if (q.type === 'mcq' || q.type === 'multiple_choice') {
                    if (studentAnswers[q.id] === q.options[q.correctOption]) {
                        totalManualScore += (parseInt(q.points) || 1);
                    }
                }
            }
        });

        const manualOralScore = parseFloat(oralReviewMarks) || 0;
        const newScore = totalManualScore + manualOralScore;
        const totalPossible = parseInt(result.total_questions) || (testQuestions.length * 1); // Fallback
        const percentage = (totalPossible > 0) ? (newScore / totalPossible) * 100 : 0;

        let recommended_level = "Beginner";
        if (percentage >= 80) recommended_level = "Advanced";
        else if (percentage >= 50) recommended_level = "Intermediate";

        // Status logic: Only 'completed' if both essay and oral are graded
        const isEssayGraded = !hasEssay || (essayMarks !== "" && essayMarks !== null && essayMarks !== undefined);
        const isOralGraded = (oralReviewMarks !== "" && oralReviewMarks !== null && oralReviewMarks !== undefined);

        const status = (isEssayGraded && isOralGraded) ? 'completed' : 'pending_review';

        // Update DB Result
        await PlacementTest.updateTestResult(resultId, {
            score: newScore,
            percentage,
            recommended_level,
            status: status,
            essay_marks: typeof essayMarks === 'object' ? JSON.stringify(essayMarks) : essayMarks,
            oral_review_marks: oralReviewMarks === "" ? 0 : oralReviewMarks,
            feedback_file: feedbackFile
        });

        res.status(200).json({ message: "Grading updated", newScore, status });
    } catch (error) {
        console.error("Grading error:", error);
        res.status(500).json({ error: error.message });
    }
};

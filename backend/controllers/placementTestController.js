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
        res.status(200).json(test);
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

        // Fetch the test to get correct answers
        const test = await PlacementTest.getPlacementTestById(test_id);
        if (!test) return res.status(404).json({ error: "Test not found" });

        // Check if student already submitted this test
        const existingResults = await PlacementTest.getResultsByStudent(student_id);
        const alreadySubmitted = existingResults.find(r => r.test_id === parseInt(test_id));
        if (alreadySubmitted) {
            return res.status(400).json({ error: "You have already submitted this placement test." });
        }

        const testQuestions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        let score = 0;
        let total_possible_points = 0;

        // Calculate total possible points first
        testQuestions.forEach(q => {
            total_possible_points += (parseInt(q.points) || 1);
        });

        // Calculate score
        testQuestions.forEach((q, index) => {
            const studentAnswer = answers[index];
            const qPoints = parseInt(q.points) || 1;

            // The admin portal saves correctOption as an index, but studentAnswer is the string value
            const correctAnswer = q.options && q.correctOption !== undefined
                ? q.options[q.correctOption]
                : (q.correctAnswer || q.answer);

            if (studentAnswer === correctAnswer && studentAnswer !== undefined) {
                score += qPoints;
            }
        });

        const percentage = total_possible_points > 0 ? (score / total_possible_points) * 100 : 0;

        // Calculate Recommended Level
        let recommended_level = "Beginner";
        if (percentage >= 80) recommended_level = "Advanced";
        else if (percentage >= 50) recommended_level = "Intermediate";

        const result = await PlacementTest.saveTestResult({
            student_id,
            test_id,
            score,
            total_questions: total_possible_points,
            percentage,
            recommended_level,
            answers,
            status: 'completed'
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

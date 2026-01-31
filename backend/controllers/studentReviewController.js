import * as model from '../models/studentReviewModel.js';

export const submitStudentReview = async (req, res) => {
    try {
        const { student_id, class_id, term_serial, rating, comment, answers } = req.body;
        const teacher_id = req.user.userId;
        const role = req.user.role;

        if (role !== 'teacher' && role !== 'admin') {
            return res.status(403).json({ error: "Only teachers or admins can submit student reviews" });
        }

        const reviewId = await model.createStudentReview({
            teacher_id,
            student_id,
            class_id,
            term_serial,
            rating,
            comment,
            answers
        });

        res.status(201).json({ message: "Student review submitted successfully", reviewId });
    } catch (error) {
        console.error("Error submitting student review:", error);
        res.status(500).json({ error: "Failed to submit student review" });
    }
};

export const getStudentReviews = async (req, res) => {
    try {
        const student_id = req.params.student_id || req.user.userId;
        const reviews = await model.getStudentReviews(student_id);
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching student reviews:", error);
        res.status(500).json({ error: "Failed to fetch student reviews" });
    }
};


export const getAllStudentReviews = async (req, res) => {
    try {
        const reviews = await model.getAllStudentReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching all student reviews:", error);
        res.status(500).json({ error: "Failed to fetch all student reviews" });
    }
};

// --- Question Management ---

export const getQuestions = async (req, res) => {
    try {
        const questions = await model.getStudentQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching student questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await model.getAllStudentQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching all student questions:", error);
        res.status(500).json({ error: "Failed to fetch all questions" });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const id = await model.createStudentQuestion(req.body);
        res.status(201).json({ message: "Question created", id });
    } catch (error) {
        console.error("Error creating student question:", error);
        res.status(500).json({ error: "Failed to create question" });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await model.updateStudentQuestion(id, req.body);
        res.status(200).json({ message: "Question updated" });
    } catch (error) {
        console.error("Error updating student question:", error);
        res.status(500).json({ error: "Failed to update question" });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await model.deleteStudentQuestion(id);
        res.status(200).json({ message: "Question deleted" });
    } catch (error) {
        console.error("Error deleting student question:", error);
        res.status(500).json({ error: "Failed to delete question" });
    }
};

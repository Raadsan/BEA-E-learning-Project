import * as model from '../models/teacherReviewModel.js';
import db from '../database/dbconfig.js';

const dbp = db.promise();

export const submitTeacherReview = async (req, res) => {
    try {
        const { teacher_id, class_id, term_serial, rating, comment, answers } = req.body;
        const student_id = req.user.userId;
        const role = req.user.role;

        if (role !== 'student' && role !== 'proficiency_student') {
            return res.status(403).json({ error: "Only students can submit teacher reviews" });
        }

        const reviewId = await model.createTeacherReview({
            student_id,
            teacher_id,
            class_id,
            term_serial,
            rating,
            comment,
            answers
        });

        res.status(201).json({ message: "Teacher review submitted successfully", reviewId });
    } catch (error) {
        console.error("Error submitting teacher review:", error);
        res.status(500).json({ error: "Failed to submit teacher review" });
    }
};

export const getTeacherReviews = async (req, res) => {
    try {
        const teacher_id = req.params.teacher_id || req.user.userId;
        const reviews = await model.getTeacherReviews(teacher_id);
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching teacher reviews:", error);
        res.status(500).json({ error: "Failed to fetch teacher reviews" });
    }
};

export const getTeachersToReview = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const role = req.user.role;

        if (role !== 'student' && role !== 'proficiency_student') {
            return res.status(403).json({ error: "Only students can fetch teachers to review" });
        }

        const [studentRows] = await dbp.query("SELECT class_id FROM students WHERE student_id = ?", [student_id]);
        if (!studentRows || studentRows.length === 0 || !studentRows[0].class_id) {
            return res.status(404).json({ error: "Student class not found" });
        }

        const teachers = await model.getTeachersByClassId(studentRows[0].class_id);
        res.status(200).json(teachers);
    } catch (error) {
        console.error("Error fetching teachers to review:", error);
        res.status(500).json({ error: "Failed to fetch teachers" });
    }
};


export const getAllTeacherReviews = async (req, res) => {
    try {
        const reviews = await model.getAllTeacherReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching all teacher reviews:", error);
        res.status(500).json({ error: "Failed to fetch all teacher reviews" });
    }
};

// --- Question Management ---

export const getQuestions = async (req, res) => {
    try {
        const questions = await model.getTeacherQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching teacher questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await model.getAllTeacherQuestions();
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching all teacher questions:", error);
        res.status(500).json({ error: "Failed to fetch all questions" });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const id = await model.createTeacherQuestion(req.body);
        res.status(201).json({ message: "Question created", id });
    } catch (error) {
        console.error("Error creating teacher question:", error);
        res.status(500).json({ error: "Failed to create question" });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await model.updateTeacherQuestion(id, req.body);
        res.status(200).json({ message: "Question updated" });
    } catch (error) {
        console.error("Error updating teacher question:", error);
        res.status(500).json({ error: "Failed to update question" });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await model.deleteTeacherQuestion(id);
        res.status(200).json({ message: "Question deleted" });
    } catch (error) {
        console.error("Error deleting teacher question:", error);
        res.status(500).json({ error: "Failed to delete question" });
    }
};

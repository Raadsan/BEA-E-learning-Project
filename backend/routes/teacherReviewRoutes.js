import express from 'express';
import {
    submitTeacherReview,
    getTeacherReviews,
    getTeachersToReview,
    getQuestions,
    getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getAllTeacherReviews
} from '../controllers/teacherReviewController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Review Submission ---
router.post('/submit', authenticateToken, submitTeacherReview);
router.get('/my-reviews', authenticateToken, getTeacherReviews);
router.get('/teacher/:teacher_id', authenticateToken, getTeacherReviews);
router.get('/to-review', authenticateToken, getTeachersToReview);
router.get('/admin/all', authenticateToken, authorizeRole(['admin']), getAllTeacherReviews);

// --- Question Management ---
router.get('/questions', authenticateToken, getQuestions);
router.get('/admin/questions/all', authenticateToken, authorizeRole(['admin']), getAllQuestions);
router.post('/admin/questions/create', authenticateToken, authorizeRole(['admin']), createQuestion);
router.put('/admin/questions/update/:id', authenticateToken, authorizeRole(['admin']), updateQuestion);
router.delete('/admin/questions/delete/:id', authenticateToken, authorizeRole(['admin']), deleteQuestion);

export default router;

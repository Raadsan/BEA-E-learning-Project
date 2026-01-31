import express from 'express';
import {
    submitStudentReview,
    getStudentReviews,
    getQuestions,
    getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getAllStudentReviews
} from '../controllers/studentReviewController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Review Submission ---
router.post('/submit', authenticateToken, submitStudentReview);
router.get('/my-reviews', authenticateToken, getStudentReviews);
router.get('/student/:student_id', authenticateToken, getStudentReviews);
router.get('/admin/all', authenticateToken, authorizeRole(['admin']), getAllStudentReviews);

// --- Question Management ---
router.get('/questions', authenticateToken, getQuestions);
router.get('/admin/questions/all', authenticateToken, authorizeRole(['admin']), getAllQuestions);
router.post('/admin/questions/create', authenticateToken, authorizeRole(['admin']), createQuestion);
router.put('/admin/questions/update/:id', authenticateToken, authorizeRole(['admin']), updateQuestion);
router.delete('/admin/questions/delete/:id', authenticateToken, authorizeRole(['admin']), deleteQuestion);

export default router;

import express from "express";
import {
  submitStudentReview, getStudentReviews, getAllStudentReviews,
  getTeacherSubmittedReviews,
  getActiveStudentReviewAssignment, getStudentReviewAssignments,
  createStudentReviewAssignment, updateStudentReviewAssignment, deleteStudentReviewAssignment,
  getQuestions, getAllQuestions, createQuestion, updateQuestion, deleteQuestion
} from "../controllers/studentReviewController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

// Review assignment boxes
router.get("/assignments/active", getActiveStudentReviewAssignment);
router.get("/admin/assignments", isAdmin, getStudentReviewAssignments);
router.post("/admin/assignments", isAdmin, createStudentReviewAssignment);
router.put("/admin/assignments/:id", isAdmin, updateStudentReviewAssignment);
router.delete("/admin/assignments/:id", isAdmin, deleteStudentReviewAssignment);

// Submit a review (teacher reviews a student)
router.post("/", submitStudentReview);

// Teacher: get reviews I submitted
router.get("/submitted-by-me", getTeacherSubmittedReviews);

// Get reviews for a specific student
router.get("/my/:student_id", getStudentReviews);

// Admin: get all reviews
router.get("/admin/all", isAdmin, getAllStudentReviews);
router.get("/", isAdmin, getAllStudentReviews);

// Questions - active only (teachers)
router.get("/questions", getQuestions);

// Admin question management
router.get("/admin/questions/all", isAdmin, getAllQuestions);
router.post("/admin/questions/create", isAdmin, createQuestion);
router.put("/admin/questions/update/:id", isAdmin, updateQuestion);
router.delete("/admin/questions/delete/:id", isAdmin, deleteQuestion);

export default router;

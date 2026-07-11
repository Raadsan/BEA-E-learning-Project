import express from "express";
import {
  submitTeacherReview, getTeacherReviews, getTeachersToReview, getAllTeacherReviews,
  getActiveTeacherReviewAssignment, getTeacherReviewAssignments,
  createTeacherReviewAssignment, updateTeacherReviewAssignment, deleteTeacherReviewAssignment,
  getQuestions, getAllQuestions, createQuestion, updateQuestion, deleteQuestion
} from "../controllers/teacherReviewController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

// Review assignment boxes
router.get("/assignments/active", getActiveTeacherReviewAssignment);
router.get("/admin/assignments", isAdmin, getTeacherReviewAssignments);
router.post("/admin/assignments", isAdmin, createTeacherReviewAssignment);
router.put("/admin/assignments/:id", isAdmin, updateTeacherReviewAssignment);
router.delete("/admin/assignments/:id", isAdmin, deleteTeacherReviewAssignment);

router.post("/", submitTeacherReview);
router.post("/submit", submitTeacherReview);
router.get("/teachers-to-review", getTeachersToReview);
router.get("/to-review", getTeachersToReview);
router.get("/teacher/:teacher_id", getTeacherReviews);
router.get("/", isAdmin, getAllTeacherReviews);
router.get("/admin/all", isAdmin, getAllTeacherReviews);

router.get("/questions", getQuestions);
router.get("/questions/all", isAdmin, getAllQuestions);
router.post("/questions", isAdmin, createQuestion);
router.put("/questions/:id", isAdmin, updateQuestion);
router.delete("/questions/:id", isAdmin, deleteQuestion);
router.get("/admin/questions/all", isAdmin, getAllQuestions);
router.post("/admin/questions/create", isAdmin, createQuestion);
router.put("/admin/questions/update/:id", isAdmin, updateQuestion);
router.delete("/admin/questions/delete/:id", isAdmin, deleteQuestion);

export default router;

import express from "express";
import {
  submitTeacherReview, getTeacherReviews, getTeachersToReview, getAllTeacherReviews,
  getQuestions, getAllQuestions, createQuestion, updateQuestion, deleteQuestion
} from "../controllers/teacherReviewController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

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

export default router;

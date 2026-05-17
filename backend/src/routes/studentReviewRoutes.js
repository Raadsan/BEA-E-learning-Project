import express from "express";
import {
  submitStudentReview, getStudentReviews, getAllStudentReviews,
  getQuestions, getAllQuestions, createQuestion, updateQuestion, deleteQuestion
} from "../controllers/studentReviewController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", submitStudentReview);
router.get("/my/:student_id", getStudentReviews);
router.get("/", isAdmin, getAllStudentReviews);
router.get("/admin/all", isAdmin, getAllStudentReviews);

router.get("/questions", getQuestions);
router.get("/questions/all", isAdmin, getAllQuestions);
router.post("/questions", isAdmin, createQuestion);
router.put("/questions/:id", isAdmin, updateQuestion);
router.delete("/questions/:id", isAdmin, deleteQuestion);

export default router;

import express from "express";
import { getLearningHours, getLearningHoursSummary } from "../controllers/learningHoursController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getLearningHours);
router.get("/summary", verifyToken, isAdmin, getLearningHoursSummary);

export default router;

import express from "express";
import { saveAttendance, getAttendance, getAttendanceReport, getStats } from "../controllers/attendanceController.js";
import { getLearningHours, getLearningHoursSummary } from "../controllers/learningHoursController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Routes
router.post("/", verifyToken, saveAttendance);
router.get("/report", verifyToken, getAttendanceReport);
router.get("/stats", verifyToken, getStats); // New stats endpoint
router.get("/learning-hours", verifyToken, getLearningHours);
router.get("/learning-hours/summary", verifyToken, getLearningHoursSummary);
router.get("/:classId/:date", verifyToken, getAttendance);

export default router;

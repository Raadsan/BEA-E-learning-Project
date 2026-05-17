import express from "express";
import {
  saveAttendance, getAttendance, getAttendanceReport, getStats
} from "../controllers/attendanceController.js";
import { getLearningHours, getLearningHoursSummary } from "../controllers/learningHoursController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", saveAttendance);
router.get("/report", getAttendanceReport);
router.get("/stats", getStats);

// Learning Hours endpoints - MUST be loaded before dynamic :classId/:date route
router.get("/learning-hours", getLearningHours);
router.get("/learning-hours/summary", getLearningHoursSummary);
router.get("/learning-hours/admin", getLearningHours);

router.get("/:classId/:date", getAttendance);

export default router;

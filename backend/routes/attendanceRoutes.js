import express from "express";
import { saveAttendance, getAttendance, getAttendanceReport } from "../controllers/attendanceController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Routes
router.post("/", verifyToken, saveAttendance);
router.get("/report", verifyToken, getAttendanceReport); // specific path first
router.get("/:classId/:date", verifyToken, getAttendance);

export default router;

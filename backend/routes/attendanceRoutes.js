import express from "express";
import { saveAttendance, getAttendance } from "../controllers/attendanceController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Routes
router.post("/", verifyToken, saveAttendance);
router.get("/:classId/:date", verifyToken, getAttendance);

export default router;

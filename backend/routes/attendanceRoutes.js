import express from "express";
import {
  saveAttendance,
  getAttendance,
  getAttendanceReport,
  getStats,
} from "../controllers/attendanceController.js";
import { verifyToken } from "../controllers/authController.js";
import db from "../database/dbconfig.js";

const router = express.Router();

// Save attendance (teacher/admin)
router.post("/", verifyToken, saveAttendance);

// Attendance reports and stats (teacher/admin)
router.get("/report", verifyToken, getAttendanceReport);
router.get("/stats", verifyToken, getStats);

// Per-student attendance history for student dashboard
router.get("/student/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const dbp = db.promise();
    const [rows] = await dbp.query(
      "SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC",
      [studentId]
    );
    res.json({ success: true, records: rows });
  } catch (err) {
    console.error("Failed to fetch attendance for student", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get attendance for a specific class/date
router.get("/:classId/:date", verifyToken, getAttendance);

export default router;


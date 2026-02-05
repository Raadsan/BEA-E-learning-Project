import express from "express";
import {
  saveAttendance,
  getAttendance,
  getAttendanceReport,
  getStats,
  getLearningHours,
  getAdminLearningHours,
  getLearningHoursSummary
} from "../controllers/attendanceController.js";
import { verifyToken } from "../controllers/authController.js";
import db from "../database/dbconfig.js";

const router = express.Router();

// Save attendance (teacher/admin)
router.post("/", verifyToken, saveAttendance);

// Attendance reports and stats (teacher/admin)
router.get("/report", verifyToken, getAttendanceReport);
router.get("/stats", verifyToken, getStats);

// Learning Hours (Student)
router.get("/learning-hours", verifyToken, getLearningHours);
router.get("/learning-hours/admin", verifyToken, getAdminLearningHours);
router.get("/learning-hours/summary", verifyToken, getLearningHoursSummary);

// Per-student attendance history for student dashboard
router.get("/student/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const dbp = db.promise();
    const [rows] = await dbp.query(
      `SELECT 
          a.*, 
          c.class_name, 
          COALESCE(co.course_title, c.class_name) as course_title,
          sp.subprogram_name,
          p.title as program_name
        FROM attendance a
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN courses co ON c.course_id = co.id
        LEFT JOIN subprograms sp ON (c.subprogram_id = sp.id OR co.subprogram_id = sp.id)
        LEFT JOIN programs p ON sp.program_id = p.id
        WHERE a.student_id COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
        ORDER BY a.date DESC`,
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


// routes/teacherRoutes.js
import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherDashboardStats,
  getTeacherClasses
} from "../controllers/teacherController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// ---------- ROUTES ----------
router.get("/dashboard/stats", verifyToken, getTeacherDashboardStats);
router.get("/classes", verifyToken, getTeacherClasses);
router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;


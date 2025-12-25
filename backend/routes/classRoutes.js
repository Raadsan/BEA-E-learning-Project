// routes/classRoutes.js
import express from "express";
import {
  createClass,
  getClasses,
  getClass,
  getClassesByCourseId,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import {
  createClassSchedule,
  getClassSchedules,
  updateClassSchedule,
  deleteClassSchedule,
  getStudentSchedules,
} from "../controllers/classScheduleController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// ---------- CLASS ROUTES ----------
router.get("/", verifyToken, getClasses);
router.get("/course/:course_id", getClassesByCourseId);
router.get("/:id", getClass);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

// ---------- CLASS SCHEDULE ROUTES ----------
router.get("/:class_id/schedules", getClassSchedules);
router.post("/:class_id/schedules", createClassSchedule);
router.put("/schedules/:id", updateClassSchedule);
router.delete("/schedules/:id", deleteClassSchedule);

// Student calendar view
router.get("/student/schedules", verifyToken, getStudentSchedules);

export default router;


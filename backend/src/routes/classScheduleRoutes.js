import express from "express";
import { createClassSchedule, getClassSchedules, getAllClassSchedules, updateClassSchedule, deleteClassSchedule, getStudentSchedules } from "../controllers/classScheduleController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/student", verifyToken, getStudentSchedules);
router.get("/", verifyToken, isAdmin, getAllClassSchedules);
router.get("/:class_id", verifyToken, getClassSchedules);
router.post("/:class_id", verifyToken, isAdmin, createClassSchedule);
router.put("/:id", verifyToken, isAdmin, updateClassSchedule);
router.delete("/:id", verifyToken, isAdmin, deleteClassSchedule);

export default router;

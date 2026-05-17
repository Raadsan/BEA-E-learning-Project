import express from "express";
import {
  createClass, getClasses, getClass, updateClass, deleteClass,
  getClassesBySubprogramId
} from "../controllers/classController.js";
import {
  createClassSchedule,
  getClassSchedules,
  getAllClassSchedules,
  updateClassSchedule,
  deleteClassSchedule,
  getStudentSchedules
} from "../controllers/classScheduleController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

// Class routes
router.post("/", createClass);
router.get("/", getClasses);
router.get("/subprogram/:subprogram_id", getClassesBySubprogramId);

// Class Schedule routes nested under classes
router.get("/all-schedules", isAdmin, getAllClassSchedules);
router.get("/student/schedules", getStudentSchedules);
router.get("/:class_id/schedules", getClassSchedules);
router.post("/:class_id/schedules", isAdmin, createClassSchedule);
router.put("/schedules/:id", isAdmin, updateClassSchedule);
router.delete("/schedules/:id", isAdmin, deleteClassSchedule);

// Class detail/crud routes
router.get("/:id", getClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;

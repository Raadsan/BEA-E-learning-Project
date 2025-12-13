// routes/courseRoutes.js
import express from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  getCoursesBySubprogramId,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

// ---------- ROUTES ----------
router.get("/", getCourses);
router.get("/subprogram/:subprogram_id", getCoursesBySubprogramId);
router.get("/:id", getCourse);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;


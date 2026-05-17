import express from "express";
import {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse
} from "../controllers/courseController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getCourse);

// Admin only
router.post("/", verifyToken, isAdmin, createCourse);
router.put("/:id", verifyToken, isAdmin, updateCourse);
router.delete("/:id", verifyToken, isAdmin, deleteCourse);

export default router;

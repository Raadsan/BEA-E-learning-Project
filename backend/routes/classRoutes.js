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
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// ---------- ROUTES ----------
router.get("/", verifyToken, getClasses);
router.get("/course/:course_id", getClassesByCourseId);
router.get("/:id", getClass);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;


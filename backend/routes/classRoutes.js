// routes/classRoutes.js
import express from "express";
import {
  createClass,
  getClasses,
  getClass,
  getClassesByCourseId,
  updateClass,
  deleteClass,
  createClassesForSubprogram,
  createClassesForAllSubprograms,
} from "../controllers/classController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// ---------- ROUTES ----------
router.get("/", verifyToken, getClasses);
router.get("/course/:course_id", getClassesByCourseId);
router.get("/:id", getClass);
router.post("/", createClass);
router.post("/create-for-subprogram", createClassesForSubprogram); // Create morning and night classes for a single subprogram
router.post("/create-for-all-subprograms", createClassesForAllSubprograms); // Create morning and night classes for ALL subprograms
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;


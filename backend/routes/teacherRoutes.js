// routes/teacherRoutes.js
import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";

const router = express.Router();

// ---------- ROUTES ----------
router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;


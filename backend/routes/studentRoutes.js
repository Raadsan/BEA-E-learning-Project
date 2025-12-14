// routes/studentRoutes.js
import express from "express";
import {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  approveStudent,
  rejectStudent
} from "../controllers/studentController.js";

const router = express.Router();

// ---------- STUDENT ROUTES ----------
router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.patch("/:id/approve", approveStudent);
router.patch("/:id/reject", rejectStudent);

export default router;


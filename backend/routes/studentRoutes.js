// routes/studentRoutes.js
import express from "express";
import {
  registerStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getSubPrograms,
  getAllSubPrograms
} from "../controllers/studentController.js";

const router = express.Router();

// ---------- STUDENT ROUTES ----------
router.post("/register", registerStudent);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

// ---------- SUB-PROGRAM ROUTES ----------
router.get("/sub-programs/all", getAllSubPrograms);
router.get("/sub-programs/:program_id", getSubPrograms);

export default router;


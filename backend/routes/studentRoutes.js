// routes/studentRoutes.js
import express from "express";
import {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  approveStudent,
  rejectStudent,
  getStudentProgress,
  getSexDistribution,
  getTopStudents,
  getStudentLocations
} from "../controllers/studentController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();


// ---------- STUDENT ROUTES ----------
// IMPORTANT: More specific routes must come before generic :id routes
router.get("/progress", verifyToken, getStudentProgress);
router.get("/sex-distribution", verifyToken, getSexDistribution);
router.get("/top-students", verifyToken, getTopStudents);
router.get("/locations", verifyToken, getStudentLocations);
router.post("/", createStudent);
router.get("/", getStudents);
router.patch("/:id/approve", approveStudent);
router.patch("/:id/reject", rejectStudent);
router.get("/:id", getStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;



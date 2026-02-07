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
  getStudentLocations,
  getMyClasses,
  getStudentsByClass,
  getDetailedStudentReport
} from "../controllers/studentController.js";
import { verifyToken } from "../controllers/authController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();


// ---------- STUDENT ROUTES ----------
// IMPORTANT: More specific routes must come before generic :id routes
router.get("/detailed-report", verifyToken, getDetailedStudentReport);
router.get("/progress", verifyToken, getStudentProgress);
router.get("/sex-distribution", verifyToken, getSexDistribution);
router.get("/top-students", verifyToken, getTopStudents);
router.get("/locations", verifyToken, getStudentLocations);
router.get("/my-classes", verifyToken, getMyClasses);
router.get("/class/:classId", verifyToken, getStudentsByClass);
router.post("/", createStudent);
router.get("/", getStudents);
router.patch("/:id/approve", approveStudent);
router.patch("/:id/reject", rejectStudent);
router.get("/:id", getStudent);
router.put("/:id", upload.single("profile_picture"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;



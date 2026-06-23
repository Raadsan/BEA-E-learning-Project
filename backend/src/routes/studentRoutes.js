import express from "express";
import {
  createStudent, getStudents, getStudent, updateStudent, deleteStudent,
  approveStudent, rejectStudent, extendStudentDeadline, getSexDistribution, getStudentLocations,
  getTopStudents, getStudentsByClass, getMyClasses, getStudentProgress
} from "../controllers/studentController.js";
import { verifyToken } from "../controllers/authController.js";
import { upload, withStoredUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", createStudent);
router.get("/", getStudents);

// Analytical / stats endpoints - MUST be loaded before dynamic :id route
router.get("/sex-distribution", verifyToken, getSexDistribution);
router.get("/locations", verifyToken, getStudentLocations);
router.get("/top-students", verifyToken, getTopStudents);
router.get("/my-classes", verifyToken, getMyClasses);
router.get("/progress", verifyToken, getStudentProgress);
router.get("/class/:classId", getStudentsByClass);

router.patch("/:id/approve", approveStudent);
router.patch("/:id/reject", rejectStudent);
router.patch("/:id/extend", verifyToken, extendStudentDeadline);
router.get("/:id", getStudent);
router.put("/:id", withStoredUpload(upload.single("profile_picture")), updateStudent);
router.delete("/:id", deleteStudent);

export default router;

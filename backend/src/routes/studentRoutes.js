import express from "express";
import {
  createStudent, getStudents, getStudent, updateStudent, deleteStudent,
  approveStudent, rejectStudent, extendStudentDeadline, getSexDistribution, getStudentLocations,
  getTopStudents
} from "../controllers/studentController.js";
import { verifyToken } from "../controllers/authController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", createStudent);
router.get("/", getStudents);

// Analytical / stats endpoints - MUST be loaded before dynamic :id route
router.get("/sex-distribution", verifyToken, getSexDistribution);
router.get("/locations", verifyToken, getStudentLocations);
router.get("/top-students", verifyToken, getTopStudents);

router.patch("/:id/approve", approveStudent);
router.patch("/:id/reject", rejectStudent);
router.patch("/:id/extend", verifyToken, extendStudentDeadline);
router.get("/:id", getStudent);
router.put("/:id", upload.single("profile_picture"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;

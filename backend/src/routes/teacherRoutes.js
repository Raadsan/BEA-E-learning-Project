import express from "express";
import {
  createTeacher, getTeachers, getTeacher, updateTeacher, deleteTeacher,
  getTeacherClasses, bulkActionTeachers, getDashboardStats, getTeacherPrograms
} from "../controllers/teacherController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";
import { upload, withStoredUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/my-classes", verifyToken, getTeacherClasses);
router.get("/classes", verifyToken, getTeacherClasses);          // alias for frontend compatibility
router.get("/programs", verifyToken, getTeacherPrograms);
router.get("/dashboard/stats", verifyToken, getDashboardStats);
router.post("/bulk-action", verifyToken, isAdmin, bulkActionTeachers);
router.post("/", withStoredUpload(upload.single("profile_picture")), createTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.put("/:id", withStoredUpload(upload.single("profile_picture")), updateTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);

export default router;


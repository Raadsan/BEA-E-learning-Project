import express from "express";
import {
  createTeacher, getTeachers, getTeacher, updateTeacher, deleteTeacher,
  getTeacherClasses, bulkActionTeachers
} from "../controllers/teacherController.js";
import { verifyToken } from "../controllers/authController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/my-classes", verifyToken, getTeacherClasses);
router.post("/bulk-action", bulkActionTeachers);
router.post("/", createTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.put("/:id", upload.single("profile_picture"), updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;

import express from "express";
import {
  getAssignments, createAssignment, submitAssignment, gradeSubmission,
  getAssignmentStats, getPerformanceClusters, getAssignmentSubmissions, getAllSubmissions,
  updateAssignment, deleteAssignment
} from "../controllers/assignmentController.js";
import { verifyToken } from "../controllers/authController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

router.use(verifyToken);

// Custom authorization middleware allowing both teachers and admins
const isTeacherOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'teacher')) {
    return res.status(403).json({ success: false, error: "Access denied. Teacher or Admin privileges required." });
  }
  next();
};

router.get("/", getAssignments);
router.get("/stats", getAssignmentStats);
router.get("/performance-clusters", getPerformanceClusters);
router.get("/submissions/:id", getAssignmentSubmissions);
router.get("/all-submissions", getAllSubmissions);

router.post("/", isTeacherOrAdmin, createAssignment);
router.post("/create", isTeacherOrAdmin, createAssignment);
router.put("/update/:id", isTeacherOrAdmin, updateAssignment);
router.delete("/delete/:id", isTeacherOrAdmin, deleteAssignment);

router.post("/submit", upload.single("file"), submitAssignment);
router.patch("/grade/:id", isTeacherOrAdmin, gradeSubmission);
router.put("/grade/:id", isTeacherOrAdmin, gradeSubmission);

export default router;

import express from "express";
import {
  getAssignments, createAssignment, submitAssignment, gradeSubmission,
  getAssignmentStats, getPerformanceClusters
} from "../controllers/assignmentController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAssignments);
router.get("/stats", getAssignmentStats);
router.get("/performance-clusters", getPerformanceClusters);

router.post("/", isAdmin, createAssignment);
router.post("/submit", upload.single("file"), submitAssignment);
router.patch("/grade/:id", isAdmin, gradeSubmission);

export default router;

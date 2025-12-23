import express from "express";
import {
    getAssignments,
    createAssignment,
    getAssignmentStats,
    getPerformanceClusters
} from "../controllers/assignmentController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Routes
router.get("/", verifyToken, getAssignments);
router.post("/", verifyToken, createAssignment);
router.get("/stats", verifyToken, getAssignmentStats);
router.get("/performance-clusters", verifyToken, getPerformanceClusters);

export default router;

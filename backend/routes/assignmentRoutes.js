import express from "express";
import {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStats,
    getPerformanceClusters,
    submitAssignment
} from "../controllers/assignmentController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Routes
router.get("/", verifyToken, getAssignments);
router.post('/create', verifyToken, createAssignment);
router.put('/update/:id', verifyToken, updateAssignment);
router.delete('/delete/:id', verifyToken, deleteAssignment);
router.post('/submit', verifyToken, submitAssignment);
router.get("/stats", verifyToken, getAssignmentStats);
router.get("/performance-clusters", verifyToken, getPerformanceClusters);

export default router;

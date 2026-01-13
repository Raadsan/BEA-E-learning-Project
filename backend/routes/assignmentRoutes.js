import express from "express";
import multer from "multer";
import path from "path";
import {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStats,
    getPerformanceClusters,
    submitAssignment,
    getAssignmentSubmissions,
    getAllSubmissions,
    gradeSubmission
} from "../controllers/assignmentController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only specific document types
    const allowedTypes = /doc|docx|pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword';

    if (extname && (mimetype || file.mimetype === 'text/plain')) {
        return cb(null, true);
    } else {
        cb(new Error('Only .doc, .docx, .pdf, and .txt files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Routes
router.get("/", verifyToken, getAssignments);
router.post('/create', verifyToken, createAssignment);
router.put('/update/:id', verifyToken, updateAssignment);
router.delete('/delete/:id', verifyToken, deleteAssignment);
router.post('/submit', verifyToken, upload.single('file'), submitAssignment);
router.get("/stats", verifyToken, getAssignmentStats);
router.get("/performance-clusters", verifyToken, getPerformanceClusters);
router.get("/all-submissions", verifyToken, getAllSubmissions);
router.get("/submissions/:id", verifyToken, getAssignmentSubmissions);
router.put("/grade/:id", verifyToken, upload.single('feedbackFile'), gradeSubmission);

export default router;

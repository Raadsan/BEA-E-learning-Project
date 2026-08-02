import express from "express";
import { verifyToken } from "../controllers/authController.js";
import { upload, uploadFile, withStoredUpload, createPresignedUpload } from "../controllers/uploadController.js";

const router = express.Router();

const isTeacherOrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "teacher")) {
        return res.status(403).json({ error: "Access denied. Teacher or Admin privileges required." });
    }
    next();
};

router.post("/presign", verifyToken, isTeacherOrAdmin, createPresignedUpload);
router.post("/", verifyToken, isTeacherOrAdmin, withStoredUpload(upload.single("file")), uploadFile);

export default router;

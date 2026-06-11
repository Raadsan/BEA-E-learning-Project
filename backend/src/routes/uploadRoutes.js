import express from "express";
import { verifyToken } from "../controllers/authController.js";
import { upload, uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

const isTeacherOrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "teacher")) {
        return res.status(403).json({ error: "Access denied. Teacher or Admin privileges required." });
    }
    next();
};

const handleUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || "File upload failed" });
        }
        next();
    });
};

router.post("/", verifyToken, isTeacherOrAdmin, handleUpload, uploadFile);

export default router;

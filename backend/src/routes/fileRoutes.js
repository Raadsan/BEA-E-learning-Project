import express from "express";
import { downloadFile, streamFile } from "../controllers/fileController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Prefer ?ref= for S3/full URLs (avoids %2F path truncation through Next/nginx).
// Keep :filename for short local names / backwards compatibility.
router.get("/stream", streamFile);
router.get("/stream/:filename", streamFile);
router.get("/download", verifyToken, downloadFile);
router.get("/download/:filename", verifyToken, downloadFile);

export default router;

import express from "express";
import { upload, uploadFile } from "../controllers/uploadController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Upload route - Apply token verification for security
router.post("/", verifyToken, upload.single('file'), uploadFile);

export default router;

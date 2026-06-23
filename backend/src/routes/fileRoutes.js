import express from "express";
import { downloadFile, streamFile } from "../controllers/fileController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.get("/stream/:filename", streamFile);
router.get("/download/:filename", verifyToken, downloadFile);

export default router;

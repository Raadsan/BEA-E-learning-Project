import express from 'express';
import { downloadFile } from '../controllers/fileController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Download file route (authenticated)
router.get('/download/:filename', verifyToken, downloadFile);

export default router;

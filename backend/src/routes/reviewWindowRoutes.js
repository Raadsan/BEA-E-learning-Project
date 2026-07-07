import express from 'express';
import {
    getReviewWindow,
    getAllReviewWindows,
    updateReviewWindow,
} from '../controllers/reviewWindowController.js';
import { verifyToken, isAdmin } from '../controllers/authController.js';

const router = express.Router();

router.get('/windows', verifyToken, isAdmin, getAllReviewWindows);
router.get('/windows/:type', verifyToken, getReviewWindow);
router.put('/windows/:type', verifyToken, isAdmin, updateReviewWindow);

export default router;

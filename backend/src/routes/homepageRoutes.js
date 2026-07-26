import express from 'express';
import { verifyToken, isAdmin } from '../controllers/authController.js';
import { getHomepageSettings, updateHomepageSettings } from '../controllers/homepageController.js';
const router = express.Router();
router.get('/', getHomepageSettings);
router.put('/', verifyToken, isAdmin, updateHomepageSettings);
export default router;

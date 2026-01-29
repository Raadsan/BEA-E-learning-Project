import express from 'express';
import CourseTimelineController from '../controllers/courseTimelineController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Public endpoint - Get all active timelines for website
router.get('/', CourseTimelineController.getTimelines);

// Admin endpoints - require authentication
// Note: This project doesn't have role-based authorization middleware, so we're using verifyToken only
// You may want to add additional role checking in the controller methods
router.get('/admin', verifyToken, CourseTimelineController.getTimelinesAdmin);
router.get('/:id', verifyToken, CourseTimelineController.getTimelineById);
router.post('/', verifyToken, CourseTimelineController.createTimeline);
router.put('/:id', verifyToken, CourseTimelineController.updateTimeline);
router.delete('/:id', verifyToken, CourseTimelineController.deleteTimeline);
router.put('/reorder/all', verifyToken, CourseTimelineController.reorderTimelines);

export default router;

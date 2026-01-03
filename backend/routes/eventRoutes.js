import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { verifyToken, isAdmin } from '../controllers/authController.js';

const router = express.Router();

// Get events (Protected)
router.get('/:subprogramId', verifyToken, eventController.getEvents);

// Create event (Admin only)
router.post('/', verifyToken, isAdmin, eventController.createEvent);

// Update event (Admin only)
router.put('/:id', verifyToken, isAdmin, eventController.updateEvent);

// Delete event (Admin only)
router.delete('/:id', verifyToken, isAdmin, eventController.deleteEvent);

export default router;

import express from 'express';
import * as timetableController from '../controllers/timetableController.js';
import { verifyToken, isAdmin } from '../controllers/authController.js';

const router = express.Router();

// Get timetable for a subprogram
// Protected: any authenticated user (student, teacher, admin) can view
router.get('/:subprogramId', verifyToken, timetableController.getTimetable);

// Create entry (Admin only)
router.post('/', verifyToken, isAdmin, timetableController.createEntry);

// Update entry (Admin only)
router.put('/:id', verifyToken, isAdmin, timetableController.updateEntry);

// Delete entry (Admin only)
router.delete('/:id', verifyToken, isAdmin, timetableController.deleteEntry);

export default router;

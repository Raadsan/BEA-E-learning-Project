import express from 'express';
import * as academicCalendarController from '../controllers/academicCalendarController.js';
import { verifyToken, isAdmin } from '../controllers/authController.js';

const router = express.Router();

// Get calendar for a subprogram (authenticated users can view)
router.get('/:subprogramId', verifyToken, academicCalendarController.getCalendar);

// Create entry (Admin only)
router.post('/', verifyToken, isAdmin, academicCalendarController.createEntry);

// Bulk create entries (Admin only)
router.post('/bulk', verifyToken, isAdmin, academicCalendarController.bulkCreate);

// Update entry (Admin only)
router.put('/:id', verifyToken, isAdmin, academicCalendarController.updateEntry);

// Delete entry (Admin only)
router.delete('/:id', verifyToken, isAdmin, academicCalendarController.deleteEntry);

// Delete all entries for a subprogram (Admin only)
router.delete('/subprogram/:subprogramId', verifyToken, isAdmin, academicCalendarController.deleteAllBySubprogram);

export default router;

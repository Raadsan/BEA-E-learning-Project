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

// ===== WEEKLY SCHEDULE ROUTES (for long-term programs) =====

// Get weekly schedule for a subprogram (authenticated users can view)
router.get('/weekly/:subprogramId', verifyToken, timetableController.getWeeklySchedule);

// Create weekly entry (Admin only)
router.post('/weekly', verifyToken, isAdmin, timetableController.createWeeklyEntry);

// Bulk create weekly entries (Admin only)
router.post('/weekly/bulk', verifyToken, isAdmin, timetableController.bulkCreateWeeklyEntries);

// Update weekly entry (Admin only)
router.put('/weekly/:id', verifyToken, isAdmin, timetableController.updateWeeklyEntry);

// Delete weekly entry (Admin only)
router.delete('/weekly/:id', verifyToken, isAdmin, timetableController.deleteWeeklyEntry);

// Delete all weekly entries for a subprogram (Admin only)
router.delete('/weekly/subprogram/:subprogramId', verifyToken, isAdmin, timetableController.deleteAllWeeklyBySubprogram);

export default router;


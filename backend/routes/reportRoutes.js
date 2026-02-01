import express from 'express';
import {
    getStudentStats,
    getProgramDistribution,
    getSubprogramDistribution,
    getPerformanceOverview,
    getDetailedStudentList,
    getStudentDetailedReport,
    getAttendanceAnalytics,
    getAssignmentCompletionAnalytics,
    getConsolidatedStats
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/student-stats', getStudentStats);
router.get('/program-distribution', getProgramDistribution);
router.get('/subprogram-distribution', getSubprogramDistribution);
router.get('/performance-overview', getPerformanceOverview);
router.get('/detailed-students', getDetailedStudentList);
router.get('/student/:studentId', getStudentDetailedReport);
router.get('/attendance-analytics', getAttendanceAnalytics);
router.get('/assignment-completion', getAssignmentCompletionAnalytics);
router.get('/consolidated-stats', getConsolidatedStats);

export default router;

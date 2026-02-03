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
    getConsolidatedStats,
    getAssessmentStats,
    getAssessmentDistribution,
    getRecentAssessments,
    getAssessmentGenderStats,
    getClassAssessmentActivity,
    getPaymentStats,
    getPaymentDistribution,
    getDetailedPaymentList
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
router.get('/assessment-stats', getAssessmentStats);
router.get('/assessment-distribution', getAssessmentDistribution);
router.get('/recent-assessments', getRecentAssessments);
router.get('/assessment-gender', getAssessmentGenderStats);
router.get('/class-assessment-activity', getClassAssessmentActivity);

// Payment Reports
router.get('/payment-stats', getPaymentStats);
router.get('/payment-distribution', getPaymentDistribution);
router.get('/payment-detailed', getDetailedPaymentList);

export default router;

import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.get('/student-stats', reportController.getStudentStats);
router.get('/program-distribution', reportController.getProgramDistribution);
router.get('/subprogram-distribution', reportController.getSubprogramDistribution);
router.get('/performance-overview', reportController.getPerformanceOverview);
router.get('/consolidated-stats', reportController.getConsolidatedStats);
router.get('/assignment-completion', reportController.getAssignmentCompletionAnalytics);
router.get('/detailed-students', reportController.getDetailedStudentList);

router.get('/assessment-stats', reportController.getAssessmentStats);
router.get('/assessment-distribution', reportController.getAssessmentDistribution);
router.get('/recent-assessments', reportController.getRecentAssessments);
router.get('/assessment-gender', reportController.getAssessmentGenderStats);
router.get('/class-assessment-activity', reportController.getClassAssessmentActivity);

router.get('/payment-stats', reportController.getPaymentStats);
router.get('/payment-distribution', reportController.getPaymentDistribution);
router.get('/payment-detailed', reportController.getDetailedPaymentList);

export default router;

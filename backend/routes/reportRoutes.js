import express from 'express';
import {
    getStudentStats,
    getProgramDistribution,
    getSubprogramDistribution,
    getPerformanceOverview
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/student-stats', getStudentStats);
router.get('/program-distribution', getProgramDistribution);
router.get('/subprogram-distribution', getSubprogramDistribution);
router.get('/performance-overview', getPerformanceOverview);

export default router;

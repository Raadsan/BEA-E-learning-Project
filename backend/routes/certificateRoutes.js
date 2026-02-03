import express from 'express';
import { getCertificates, getCertificateByTarget, upsertCertificate, deleteCertificate } from '../controllers/certificateController.js';
import { downloadCertificate, getIssuedCertificates, getMyIssuedCertificates } from '../controllers/studentCertificateController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Routes (students can view certificates but not modify them)
router.get('/', authenticateToken, authorizeRole(['admin', 'student', 'proficiency_student']), getCertificates);
router.get('/issued', authenticateToken, authorizeRole(['admin']), getIssuedCertificates);
router.get('/target/:target_type/:target_id', authenticateToken, authorizeRole(['admin']), getCertificateByTarget);
router.post('/', authenticateToken, authorizeRole(['admin']), upsertCertificate);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteCertificate);

// Student Routes
router.get('/my-issued', authenticateToken, authorizeRole(['student', 'proficiency_student']), getMyIssuedCertificates);
router.get('/download/:target_type/:target_id', authenticateToken, downloadCertificate);

export default router;

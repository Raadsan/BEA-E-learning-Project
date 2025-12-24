import express from 'express';
import { createEvcPayment, createBankPayment, createWaafiPayment } from '../controllers/paymentController.js';
import { confirmWaafiPayment } from '../controllers/waafiController.js';

const router = express.Router();

router.post('/evc', createEvcPayment);
router.post('/bank', createBankPayment);
router.post('/waafi', createWaafiPayment);
router.post('/waafi/confirm', confirmWaafiPayment);

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { getAllPayments } = await import('../models/paymentModel.js');
    const payments = await getAllPayments();
    res.json({ success: true, payments });
  } catch (err) {
    console.error('Failed to get all payments', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET payments for student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { getPaymentsForStudent } = await import('../models/paymentModel.js');
    const payments = await getPaymentsForStudent(req.params.studentId);
    res.json({ success: true, payments });
  } catch (err) {
    console.error('Failed to get payments for student', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
import express from "express";
import {
  createEvcPayment, createWaafiPayment, extendExpiredPayment, getExpiredPayments, getPayments, getStudentPayments,
  revokePaymentAccess, updatePaymentAccessExpiry
} from "../controllers/paymentController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.get('/expired', isAdmin, getExpiredPayments);
router.patch('/expired/:studentId/extend', isAdmin, extendExpiredPayment);
router.patch('/expired/:studentId/expiry', isAdmin, updatePaymentAccessExpiry);
router.delete('/expired/:studentId/access', isAdmin, revokePaymentAccess);

router.post("/evc", createEvcPayment);
router.post("/waafi", createWaafiPayment);
router.get("/", isAdmin, getPayments);
router.get("/student/:studentId", getStudentPayments);

export default router;

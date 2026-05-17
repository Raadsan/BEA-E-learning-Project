import express from "express";
import {
  createEvcPayment, createWaafiPayment, getPayments
} from "../controllers/paymentController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/evc", createEvcPayment);
router.post("/waafi", createWaafiPayment);
router.get("/", isAdmin, getPayments);

export default router;

import express from "express";
import { confirmWaafiPayment } from "../controllers/waafiController.js";

const router = express.Router();

router.post("/confirm", confirmWaafiPayment);

export default router;

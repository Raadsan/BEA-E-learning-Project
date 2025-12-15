// routes/authRoutes.js
import express from "express";
import { login, getCurrentUser, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// ---------- AUTH ROUTES ----------
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

export default router;


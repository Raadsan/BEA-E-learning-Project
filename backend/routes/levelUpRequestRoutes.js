
import express from "express";
import * as LevelUpRequestController from "../controllers/levelUpRequestController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes (requires authentication)
router.post("/", authenticateToken, LevelUpRequestController.createRequest);
router.get("/my-requests", authenticateToken, LevelUpRequestController.getMyRequests);
router.get("/check-eligibility", authenticateToken, LevelUpRequestController.checkEligibility);

// Admin routes (should ideally check role too, but following existing pattern)
router.get("/all", authenticateToken, LevelUpRequestController.getAllRequests);
router.patch("/:id/status", authenticateToken, LevelUpRequestController.updateRequestStatus);

export default router;

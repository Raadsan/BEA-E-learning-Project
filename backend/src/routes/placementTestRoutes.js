import express from "express";
import {
  createPlacementTest, getAllPlacementTests, getPlacementTestById, submitPlacementTest, getAllPlacementResults
} from "../controllers/placementTestController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAllPlacementTests);
router.get("/:id", getPlacementTestById);
router.post("/submit", submitPlacementTest);

// Admin only
router.post("/", verifyToken, isAdmin, createPlacementTest);
router.get("/results/all", verifyToken, isAdmin, getAllPlacementResults);

export default router;

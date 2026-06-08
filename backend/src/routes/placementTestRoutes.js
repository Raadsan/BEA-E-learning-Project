import express from "express";
import {
  createPlacementTest,
  getAllPlacementTests,
  getPlacementTestById,
  submitPlacementTest,
  getAllPlacementResults,
  getStudentPlacementResults,
  gradePlacementTest,
} from "../controllers/placementTestController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAllPlacementTests);
router.post("/submit", submitPlacementTest);
router.get("/results/all", verifyToken, isAdmin, getAllPlacementResults);
router.get("/results/:studentId", getStudentPlacementResults);
router.put("/results/:resultId/grade", verifyToken, isAdmin, gradePlacementTest);
router.get("/:id", getPlacementTestById);

// Admin only
router.post("/", verifyToken, isAdmin, createPlacementTest);

export default router;

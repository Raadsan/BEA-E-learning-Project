import express from "express";
import {
    createPlacementTest,
    getAllPlacementTests,
    getPlacementTestById,
    updatePlacementTest,
    deletePlacementTest,
    submitPlacementTest,
    getStudentPlacementResults,
    getAllPlacementResults,
    gradePlacementTest,
} from "../controllers/placementTestController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/", verifyToken, createPlacementTest);
router.post("/submit", verifyToken, submitPlacementTest);
router.get("/", verifyToken, getAllPlacementTests);
router.get("/:id", verifyToken, getPlacementTestById);
router.get("/results/all", verifyToken, getAllPlacementResults);
router.get("/results/:studentId", verifyToken, getStudentPlacementResults);
router.put("/results/:resultId/grade", verifyToken, gradePlacementTest);
router.put("/:id", verifyToken, updatePlacementTest);
router.delete("/:id", verifyToken, deletePlacementTest);

export default router;

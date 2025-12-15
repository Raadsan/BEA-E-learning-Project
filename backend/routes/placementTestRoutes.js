import express from "express";
import {
    createPlacementTest,
    getAllPlacementTests,
    getPlacementTestById,
    updatePlacementTest,
    deletePlacementTest,
} from "../controllers/placementTestController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/", verifyToken, createPlacementTest);
router.get("/", verifyToken, getAllPlacementTests);
router.get("/:id", verifyToken, getPlacementTestById);
router.put("/:id", verifyToken, updatePlacementTest);
router.delete("/:id", verifyToken, deletePlacementTest);

export default router;

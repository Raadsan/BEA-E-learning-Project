import express from "express";
import {
    getTutorials,
    getTutorialById,
    createTutorial,
    updateTutorial,
    deleteTutorial,
} from "../controllers/tutorialController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getTutorials);
router.get("/:id", getTutorialById);
router.post("/", verifyToken, isAdmin, createTutorial);
router.put("/:id", verifyToken, isAdmin, updateTutorial);
router.delete("/:id", verifyToken, isAdmin, deleteTutorial);

export default router;

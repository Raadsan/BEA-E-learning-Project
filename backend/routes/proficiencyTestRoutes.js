import express from "express";
import {
    createProficiencyTest,
    getAllProficiencyTests,
    getProficiencyTestById,
    updateProficiencyTest,
    deleteProficiencyTest,
    submitProficiencyTest,
    getStudentProficiencyResults,
} from "../controllers/proficiencyTestController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/", verifyToken, createProficiencyTest);
router.get("/", verifyToken, getAllProficiencyTests);
router.get("/:id", verifyToken, getProficiencyTestById);
router.put("/:id", verifyToken, updateProficiencyTest);
router.delete("/:id", verifyToken, deleteProficiencyTest);

// Results Routes
router.post("/submit", verifyToken, submitProficiencyTest);
router.get("/student/:studentId/results", verifyToken, getStudentProficiencyResults);

export default router;

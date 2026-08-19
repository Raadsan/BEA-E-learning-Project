import express from "express";
import {
  createProficiencyTest, getAllProficiencyTests, getProficiencyTestById, updateProficiencyTest, deleteProficiencyTest,
  submitProficiencyTest, getAllProficiencyResults, gradeProficiencyTest,
  startProficiencyTest, getStudentProficiencyResults, unlockProficiencyAttempt,
  deleteProficiencyResult
} from "../controllers/proficiencyTestController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAllProficiencyTests);
router.post("/submit", submitProficiencyTest);
router.post("/start", startProficiencyTest);
router.get("/student/:studentId/results", getStudentProficiencyResults);

// Admin only
router.post("/", verifyToken, isAdmin, createProficiencyTest);
router.put("/:id", verifyToken, isAdmin, updateProficiencyTest);
router.delete("/:id", verifyToken, isAdmin, deleteProficiencyTest);
router.get("/results/all", verifyToken, isAdmin, getAllProficiencyResults);
router.delete("/results/:resultId", verifyToken, isAdmin, deleteProficiencyResult);
router.patch("/results/:resultId/grade", verifyToken, isAdmin, gradeProficiencyTest);
router.delete("/attempts/:attemptId/lock", verifyToken, isAdmin, unlockProficiencyAttempt);
router.get("/:id", getProficiencyTestById);

export default router;

import express from "express";
import {
  createProficiencyTest, getAllProficiencyTests, getProficiencyTestById, updateProficiencyTest, deleteProficiencyTest,
  submitProficiencyTest, getAllProficiencyResults, gradeProficiencyTest
} from "../controllers/proficiencyTestController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAllProficiencyTests);
router.get("/:id", getProficiencyTestById);
router.post("/submit", submitProficiencyTest);

// Admin only
router.post("/", verifyToken, isAdmin, createProficiencyTest);
router.put("/:id", verifyToken, isAdmin, updateProficiencyTest);
router.delete("/:id", verifyToken, isAdmin, deleteProficiencyTest);
router.get("/results/all", verifyToken, isAdmin, getAllProficiencyResults);
router.patch("/results/:resultId/grade", verifyToken, isAdmin, gradeProficiencyTest);

export default router;

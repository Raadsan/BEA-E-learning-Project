import express from "express";
import * as ProficiencyController from "../controllers/proficiencyTestStudentsController.js";

const router = express.Router();

// Public Routes
router.post("/register", ProficiencyController.registerCandidate);

// Admin Routes (To be protected by auth middleware if needed)
router.get("/all", ProficiencyController.getCandidates);
router.patch("/extend/:id", ProficiencyController.extendCandidateDeadline);
router.patch("/status/:id", ProficiencyController.updateCandidateStatus);
router.patch("/update/:id", ProficiencyController.updateCandidate);
router.delete("/delete/:id", ProficiencyController.deleteCandidate);


export default router;

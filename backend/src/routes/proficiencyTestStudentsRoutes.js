import express from "express";
import { registerCandidate, updateCandidate, getCandidates, extendCandidateDeadline, updateCandidateStatus, deleteCandidate } from "../controllers/proficiencyTestStudentsController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerCandidate);

router.get("/", verifyToken, isAdmin, getCandidates);
router.get("/all", verifyToken, isAdmin, getCandidates); // Alias

router.put("/:id", verifyToken, isAdmin, updateCandidate);
router.patch("/update/:id", verifyToken, isAdmin, updateCandidate); // Alias

router.patch("/:id/extend", verifyToken, isAdmin, extendCandidateDeadline);
router.patch("/extend/:id", verifyToken, isAdmin, extendCandidateDeadline); // Alias

router.patch("/:id/status", verifyToken, isAdmin, updateCandidateStatus);
router.patch("/status/:id", verifyToken, isAdmin, updateCandidateStatus); // Alias

router.delete("/:id", verifyToken, isAdmin, deleteCandidate);
router.delete("/delete/:id", verifyToken, isAdmin, deleteCandidate); // Alias

export default router;

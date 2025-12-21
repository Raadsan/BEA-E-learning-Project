import express from "express";
import {
    createProficiencyTest,
    getAllProficiencyTests,
    getProficiencyTestById,
    updateProficiencyTest,
    deleteProficiencyTest,
} from "../controllers/proficiencyTestController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/", verifyToken, createProficiencyTest);
router.get("/", verifyToken, getAllProficiencyTests);
router.get("/:id", verifyToken, getProficiencyTestById);
router.put("/:id", verifyToken, updateProficiencyTest);
router.delete("/:id", verifyToken, deleteProficiencyTest);

export default router;

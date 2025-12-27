// routes/materialRoutes.js
import express from "express";
import {
    createMaterial,
    getMaterials,
    getStudentMaterials,
    updateMaterial,
    deleteMaterial
} from "../controllers/materialController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Admin routes
router.get("/", verifyToken, getMaterials);
router.post("/", verifyToken, createMaterial);
router.put("/:id", verifyToken, updateMaterial);
router.delete("/:id", verifyToken, deleteMaterial);

// Student routes
router.get("/student", verifyToken, getStudentMaterials);

export default router;

import express from "express";
import { createMaterial, getMaterials, getStudentMaterials, updateMaterial, deleteMaterial } from "../controllers/materialController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/student", verifyToken, getStudentMaterials);
router.get("/", getMaterials);
router.post("/", verifyToken, isAdmin, createMaterial);
router.put("/:id", verifyToken, isAdmin, updateMaterial);
router.delete("/:id", verifyToken, isAdmin, deleteMaterial);

export default router;

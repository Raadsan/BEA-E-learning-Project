import express from "express";
import { createMaterial, getMaterials, getStudentMaterials, updateMaterial, deleteMaterial } from "../controllers/materialController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";
import { upload, uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/student", verifyToken, getStudentMaterials);
router.get("/", getMaterials);
router.post("/", verifyToken, isAdmin, createMaterial);
router.post("/upload", verifyToken, isAdmin, upload.single("file"), uploadFile);
router.put("/:id", verifyToken, isAdmin, updateMaterial);
router.delete("/:id", verifyToken, isAdmin, deleteMaterial);

export default router;

import express from "express";
import { createPackage, getAllPackages, getPackageById, updatePackage, deletePackage, assignToProgram, updateProgramAssignment, removeFromProgram } from "../controllers/paymentPackageController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAllPackages);
router.get("/:id", getPackageById);
router.post("/", verifyToken, isAdmin, createPackage);
router.put("/:id", verifyToken, isAdmin, updatePackage);
router.delete("/:id", verifyToken, isAdmin, deletePackage);
router.post("/:id/assign", verifyToken, isAdmin, assignToProgram);
router.put("/:id/programs/:programId", verifyToken, isAdmin, updateProgramAssignment);
router.delete("/:id/programs/:programId", verifyToken, isAdmin, removeFromProgram);

export default router;

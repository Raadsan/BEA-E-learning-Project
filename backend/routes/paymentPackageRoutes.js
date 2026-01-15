import express from "express";
import * as paymentPackageController from "../controllers/paymentPackageController.js";

const router = express.Router();

router.post("/", paymentPackageController.createPackage);
router.get("/", paymentPackageController.getAllPackages);
router.get("/:id", paymentPackageController.getPackageById);
router.put("/:id", paymentPackageController.updatePackage);
router.delete("/:id", paymentPackageController.deletePackage);

// Program assignment routes
router.post("/:id/assign", paymentPackageController.assignToProgram);
router.delete("/:id/programs/:programId", paymentPackageController.removeFromProgram);

export default router;

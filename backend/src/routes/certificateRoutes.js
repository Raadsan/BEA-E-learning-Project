import express from "express";
import { downloadCertificate, getIssuedCertificates, getMyIssuedCertificates } from "../controllers/studentCertificateController.js";
import { getCertificates, getCertificateByTarget, upsertCertificate, deleteCertificate } from "../controllers/certificateController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

// Certificate Configuration / Admin Routes
router.get("/", verifyToken, getCertificates);
router.get("/target/:target_type/:target_id", verifyToken, getCertificateByTarget);
router.post("/", verifyToken, isAdmin, upsertCertificate);
router.delete("/:id", verifyToken, isAdmin, deleteCertificate);

// Issued Certificates / Student Routes
router.get("/download/:target_type/:target_id", verifyToken, downloadCertificate);
router.get("/my-issued", verifyToken, getMyIssuedCertificates);
router.get("/issued", verifyToken, isAdmin, getIssuedCertificates);

export default router;

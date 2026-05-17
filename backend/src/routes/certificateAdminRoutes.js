import express from "express";
import { getCertificates, getCertificateByTarget, upsertCertificate, deleteCertificate } from "../controllers/certificateController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getCertificates);
router.get("/:target_type/:target_id", getCertificateByTarget);
router.post("/", verifyToken, isAdmin, upsertCertificate);
router.delete("/:id", verifyToken, isAdmin, deleteCertificate);

export default router;

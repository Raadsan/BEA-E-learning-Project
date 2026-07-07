import express from "express";
import {
    getPolicies,
    getPolicyBySlug,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
} from "../controllers/policyController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getPolicies);
router.get("/slug/:slug", getPolicyBySlug);
router.get("/:id", getPolicyById);
router.post("/", verifyToken, isAdmin, createPolicy);
router.put("/:id", verifyToken, isAdmin, updatePolicy);
router.delete("/:id", verifyToken, isAdmin, deletePolicy);

export default router;

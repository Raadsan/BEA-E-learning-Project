import express from "express";
import {
  createShift, getShifts, getShift, updateShift, deleteShift
} from "../controllers/shiftController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getShifts);
router.get("/:id", getShift);

// Admin only
router.post("/", verifyToken, isAdmin, createShift);
router.put("/:id", verifyToken, isAdmin, updateShift);
router.delete("/:id", verifyToken, isAdmin, deleteShift);

export default router;

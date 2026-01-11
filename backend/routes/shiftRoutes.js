// routes/shiftRoutes.js
import express from "express";
import {
    createShift,
    getShifts,
    getShift,
    updateShift,
    deleteShift
} from "../controllers/shiftController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.get("/", verifyToken, getShifts);
router.get("/:id", verifyToken, getShift);
router.post("/", verifyToken, createShift);
router.put("/:id", verifyToken, updateShift);
router.delete("/:id", verifyToken, deleteShift);

export default router;

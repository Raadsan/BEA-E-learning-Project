import express from "express";
import {
  createProgram, getPrograms, getProgram, updateProgram, deleteProgram
} from "../controllers/programController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/", getPrograms);
router.get("/:id", getProgram);

// Admin only routes
router.post("/", verifyToken, isAdmin, upload.any(), createProgram);
router.put("/:id", verifyToken, isAdmin, upload.any(), updateProgram);
router.delete("/:id", verifyToken, isAdmin, deleteProgram);

export default router;

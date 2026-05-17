import express from "express";
import {
  createSubprogram, getSubprograms, getSubprogramsByProgramId, getSubprogram,
  updateSubprogram, deleteSubprogram
} from "../controllers/subprogramController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getSubprograms);
router.get("/program/:program_id", getSubprogramsByProgramId);
router.get("/:id", getSubprogram);

// Admin only
router.post("/", verifyToken, isAdmin, createSubprogram);
router.put("/:id", verifyToken, isAdmin, updateSubprogram);
router.delete("/:id", verifyToken, isAdmin, deleteSubprogram);

export default router;

// routes/subprogramRoutes.js
import express from "express";
import {
  createSubprogram,
  getSubprograms,
  getSubprogram,
  getSubprogramsByProgramId,
  updateSubprogram,
  deleteSubprogram,
} from "../controllers/subprogramController.js";

const router = express.Router();

// ---------- ROUTES ----------
// IMPORTANT: Order matters! Specific routes must come before parameterized routes
router.get("/", getSubprograms);
router.get("/program/:program_id", getSubprogramsByProgramId);
router.get("/:id", getSubprogram);
router.post("/", createSubprogram);
router.put("/:id", updateSubprogram);
router.delete("/:id", deleteSubprogram);

export default router;


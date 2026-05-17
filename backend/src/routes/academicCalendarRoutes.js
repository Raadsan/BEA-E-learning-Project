import express from "express";
import { getCalendar, createEntry, updateEntry, deleteEntry, bulkCreate, deleteAllBySubprogram } from "../controllers/academicCalendarController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/subprogram/:subprogramId", getCalendar);
router.post("/", verifyToken, isAdmin, createEntry);
router.post("/bulk", verifyToken, isAdmin, bulkCreate);
router.put("/:id", verifyToken, isAdmin, updateEntry);
router.delete("/subprogram/:subprogramId/all", verifyToken, isAdmin, deleteAllBySubprogram);
router.delete("/:id", verifyToken, isAdmin, deleteEntry);

export default router;

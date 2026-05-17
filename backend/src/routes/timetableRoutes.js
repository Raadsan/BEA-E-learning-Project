import express from "express";
import {
  getTimetable, createEntry, updateEntry, deleteEntry,
  getWeeklySchedule, createWeeklyEntry, deleteWeeklyEntry, bulkCreateWeeklyEntries
} from "../controllers/timetableController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/subprogram/:subprogramId", getTimetable);
router.get("/weekly/:subprogramId", getWeeklySchedule);

// Admin only
router.post("/", verifyToken, isAdmin, createEntry);
router.put("/:id", verifyToken, isAdmin, updateEntry);
router.delete("/:id", verifyToken, isAdmin, deleteEntry);

router.post("/weekly", verifyToken, isAdmin, createWeeklyEntry);
router.post("/weekly/bulk", verifyToken, isAdmin, bulkCreateWeeklyEntries);
router.delete("/weekly/:id", verifyToken, isAdmin, deleteWeeklyEntry);

export default router;

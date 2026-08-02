import express from "express";
import {
  getTimetable, createEntry, updateEntry, deleteEntry,
  getWeeklySchedule, createWeeklyEntry, deleteWeeklyEntry, bulkCreateWeeklyEntries,
  getTimelineRanges, createTimelineRange, updateTimelineRange, deleteTimelineRange,
  getTimelineActivities, createTimelineActivity, updateTimelineActivity, deleteTimelineActivity
} from "../controllers/timetableController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/subprogram/:subprogramId", getTimetable);
router.get("/weekly/:subprogramId", getWeeklySchedule);
router.get("/timeline-ranges", verifyToken, isAdmin, getTimelineRanges);
router.post("/timeline-ranges", verifyToken, isAdmin, createTimelineRange);
router.put("/timeline-ranges/:groupId", verifyToken, isAdmin, updateTimelineRange);
router.delete("/timeline-ranges/:groupId", verifyToken, isAdmin, deleteTimelineRange);
router.get("/timeline-ranges/:groupId/activities/:subprogramId", verifyToken, isAdmin, getTimelineActivities);
router.post("/timeline-activities", verifyToken, isAdmin, createTimelineActivity);
router.put("/timeline-activities/:id", verifyToken, isAdmin, updateTimelineActivity);
router.delete("/timeline-activities/:id", verifyToken, isAdmin, deleteTimelineActivity);

// Admin only
router.post("/", verifyToken, isAdmin, createEntry);
router.put("/:id", verifyToken, isAdmin, updateEntry);
router.delete("/:id", verifyToken, isAdmin, deleteEntry);

router.post("/weekly", verifyToken, isAdmin, createWeeklyEntry);
router.post("/weekly/bulk", verifyToken, isAdmin, bulkCreateWeeklyEntries);
router.delete("/weekly/:id", verifyToken, isAdmin, deleteWeeklyEntry);

export default router;

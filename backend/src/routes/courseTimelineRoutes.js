import express from "express";
import CourseTimelineController from "../controllers/courseTimelineController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", CourseTimelineController.getTimelines);
router.get("/admin", verifyToken, isAdmin, CourseTimelineController.getTimelinesAdmin);

// Admin only
router.post("/", verifyToken, isAdmin, CourseTimelineController.createTimeline);
router.put("/:id", verifyToken, isAdmin, CourseTimelineController.updateTimeline);
router.delete("/:id", verifyToken, isAdmin, CourseTimelineController.deleteTimeline);

export default router;

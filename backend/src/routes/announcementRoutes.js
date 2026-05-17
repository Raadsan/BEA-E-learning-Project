import express from "express";
import {
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getTeacherAnnouncements
} from "../controllers/announcementController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.get("/teacher", verifyToken, getTeacherAnnouncements);

// Admin only
router.post("/", verifyToken, isAdmin, createAnnouncement);
router.put("/:id", verifyToken, isAdmin, updateAnnouncement);
router.delete("/:id", verifyToken, isAdmin, deleteAnnouncement);

export default router;

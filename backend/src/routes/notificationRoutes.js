import express from "express";
import {
  createNotification, getNotifications, markAsRead, deleteNotification, sendTestReminderEmail
} from "../controllers/notificationController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createNotification);
router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);
router.post("/test-reminder", sendTestReminderEmail);

export default router;


import express from "express";
import { verifyToken } from "../controllers/authController.js";
import { createNotification, getNotifications, markAsRead, deleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", verifyToken, createNotification);
router.get("/", verifyToken, getNotifications); // Admin sees all?
router.put("/:id/read", verifyToken, markAsRead);
router.delete("/:id", verifyToken, deleteNotification);

export default router;

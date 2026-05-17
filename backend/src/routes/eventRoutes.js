import express from "express";
import {
  getEvents, createEvent, updateEvent, deleteEvent
} from "../controllers/eventController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/subprogram/:subprogramId", getEvents);

// Admin only
router.post("/", verifyToken, isAdmin, createEvent);
router.put("/:id", verifyToken, isAdmin, updateEvent);
router.delete("/:id", verifyToken, isAdmin, deleteEvent);

export default router;

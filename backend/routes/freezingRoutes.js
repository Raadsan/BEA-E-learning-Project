
import express from "express";
import {
    createRequest,
    getAllRequests,
    getMyRequests,
    updateRequestStatus
} from "../controllers/freezingRequestController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

// Student routes
router.post("/create", verifyToken, createRequest);
router.get("/my", verifyToken, getMyRequests);

// Admin routes
router.get("/all", verifyToken, isAdmin, getAllRequests);
router.patch("/status/:id", verifyToken, isAdmin, updateRequestStatus);

export default router;

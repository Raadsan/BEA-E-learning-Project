import express from "express";
import { verifyToken } from "../controllers/authController.js";
import { createRequest, getAllRequests, getMyRequests, updateRequestStatus } from "../controllers/sessionRequestController.js";

const router = express.Router();

router.post("/", verifyToken, createRequest);
router.get("/", verifyToken, getAllRequests); // Admin only ideally
router.get("/my-requests", verifyToken, getMyRequests);
router.patch("/:id/status", verifyToken, updateRequestStatus);

export default router;

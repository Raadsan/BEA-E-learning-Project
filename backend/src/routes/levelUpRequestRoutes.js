import express from "express";
import { createRequest, checkEligibility, getAllRequests, getMyRequests, updateRequestStatus } from "../controllers/levelUpRequestController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createRequest);
router.get("/eligibility", checkEligibility);
router.get("/my", getMyRequests);
router.get("/", isAdmin, getAllRequests);
router.get("/all", isAdmin, getAllRequests);
router.patch("/:id/status", isAdmin, updateRequestStatus);

export default router;

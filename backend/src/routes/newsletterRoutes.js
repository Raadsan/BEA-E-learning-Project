import express from "express";
import { subscribe, getSubscribers, deleteSubscriber } from "../controllers/newsletterController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/subscribe", subscribe);
router.get("/", verifyToken, isAdmin, getSubscribers);
router.get("/subscribers", verifyToken, isAdmin, getSubscribers);
router.delete("/:id", verifyToken, isAdmin, deleteSubscriber);

export default router;

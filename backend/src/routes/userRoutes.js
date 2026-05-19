import express from "express";
import { getAllUsers, bulkActionUsers } from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllUsers);
router.post("/bulk-action", verifyToken, isAdmin, bulkActionUsers);

export default router;

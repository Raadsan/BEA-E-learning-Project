// routes/userRoutes.js
import express from "express";
import { getUsers } from "../controllers/userController.js";

const router = express.Router();

// ---------- USER ROUTES ----------
router.get("/", getUsers);

export default router;


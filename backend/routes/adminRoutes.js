// routes/adminRoutes.js
import express from "express";
import {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
} from "../controllers/adminController.js";

const router = express.Router();

// ---------- ADMIN ROUTES ----------
router.post("/", createAdmin);
router.get("/", getAdmins);
router.get("/:id", getAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;





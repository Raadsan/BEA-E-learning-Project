import express from "express";
import { getAdmins, getAdmin, createAdmin, updateAdmin, deleteAdmin } from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/", getAdmins);
router.get("/:id", getAdmin);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;

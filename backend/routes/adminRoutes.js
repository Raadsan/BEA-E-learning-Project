import express from "express";
import {
    getAdmins,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from "../controllers/adminController.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/", getAdmins);
router.get("/:id", getAdmin);
router.post("/", createAdmin);
router.put("/:id", upload.single("profile_picture"), updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;

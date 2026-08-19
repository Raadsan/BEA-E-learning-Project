import express from "express";
import { getAdmins, getAdmin, createAdmin, updateAdmin, deleteAdmin, bulkActionAdmins } from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";
import { upload, withStoredUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/", getAdmins);
router.get("/:id", getAdmin);
router.post("/", withStoredUpload(upload.single("profile_picture")), createAdmin);
router.post("/bulk-action", bulkActionAdmins);
router.put("/:id", withStoredUpload(upload.single("profile_picture")), updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;


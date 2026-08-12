import express from "express";
import { getContacts, createContact, deleteContact, getContactPage, updateContactPage, createSupportRequest, getMySupportRequests, getSupportRequests, replySupportRequest, deleteSupportRequest } from "../controllers/contactController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/", createContact);
router.get("/page-content", getContactPage);
router.put("/page-content", verifyToken, isAdmin, updateContactPage);
router.post("/support", verifyToken, createSupportRequest);
router.get("/support/mine", verifyToken, getMySupportRequests);
router.get("/support/admin", verifyToken, isAdmin, getSupportRequests);
router.patch("/support/:id/reply", verifyToken, isAdmin, replySupportRequest);
router.delete("/support/:id", verifyToken, deleteSupportRequest);
router.get("/", verifyToken, isAdmin, getContacts);
router.delete("/:id", verifyToken, isAdmin, deleteContact);

export default router;

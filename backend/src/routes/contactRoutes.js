import express from "express";
import { getContacts, createContact, deleteContact, getContactPage, updateContactPage } from "../controllers/contactController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/", createContact);
router.get("/page-content", getContactPage);
router.put("/page-content", verifyToken, isAdmin, updateContactPage);
router.get("/", verifyToken, isAdmin, getContacts);
router.delete("/:id", verifyToken, isAdmin, deleteContact);

export default router;

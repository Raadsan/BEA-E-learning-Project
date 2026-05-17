import express from "express";
import { getContacts, createContact, deleteContact } from "../controllers/contactController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", verifyToken, isAdmin, getContacts);
router.delete("/:id", verifyToken, isAdmin, deleteContact);

export default router;

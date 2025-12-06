// routes/contactRoutes.js
import express from "express";
import {
  createContact,
  getContacts,
  getContact,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

// ---------- ROUTES ----------
router.post("/", createContact);
router.get("/", getContacts);
router.get("/:id", getContact);
router.delete("/:id", deleteContact);

export default router;


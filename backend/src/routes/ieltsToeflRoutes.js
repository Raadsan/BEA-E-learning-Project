import express from "express";
import {
  getAllIeltsStudents, createIeltsStudent, getIeltsStudent, updateIeltsStudent, deleteIeltsStudent
} from "../controllers/ieltsToeflController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllIeltsStudents);
router.post("/", createIeltsStudent);
router.get("/:id", verifyToken, getIeltsStudent);
router.put("/:id", verifyToken, updateIeltsStudent);
router.delete("/:id", verifyToken, isAdmin, deleteIeltsStudent);

export default router;

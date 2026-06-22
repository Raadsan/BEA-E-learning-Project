import express from "express";
import {
  getAllIeltsStudents, createIeltsStudent, getIeltsStudent, updateIeltsStudent, deleteIeltsStudent,
  approveIeltsStudent, rejectIeltsStudent, extendIeltsDeadline, assignIeltsClass
} from "../controllers/ieltsToeflController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllIeltsStudents);
router.post("/", createIeltsStudent);
router.post("/approve/:id", verifyToken, isAdmin, approveIeltsStudent);
router.post("/reject/:id", verifyToken, isAdmin, rejectIeltsStudent);
router.post("/extend-deadline/:id", verifyToken, isAdmin, extendIeltsDeadline);
router.post("/assign-class/:id", verifyToken, isAdmin, assignIeltsClass);
router.get("/:id", verifyToken, getIeltsStudent);
router.put("/:id", verifyToken, updateIeltsStudent);
router.delete("/:id", verifyToken, isAdmin, deleteIeltsStudent);

export default router;

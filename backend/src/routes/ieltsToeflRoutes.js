import express from "express";
import {
  getAllIeltsStudents, createIeltsStudent, getIeltsStudent, updateIeltsStudent, deleteIeltsStudent,
  approveIeltsStudent, rejectIeltsStudent, extendIeltsDeadline, assignIeltsClass
} from "../controllers/ieltsToeflController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";
import { upload, withStoredUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllIeltsStudents);
router.post("/", withStoredUpload(upload.single("certificate_document")), createIeltsStudent);
router.post("/approve/:id", verifyToken, isAdmin, approveIeltsStudent);
router.post("/reject/:id", verifyToken, isAdmin, rejectIeltsStudent);
router.post("/extend-deadline/:id", verifyToken, isAdmin, extendIeltsDeadline);
router.post("/assign-class/:id", verifyToken, isAdmin, assignIeltsClass);
router.get("/:id", verifyToken, getIeltsStudent);
router.put("/:id", withStoredUpload(upload.single("certificate_document")), verifyToken, updateIeltsStudent);
router.delete("/:id", verifyToken, isAdmin, deleteIeltsStudent);

export default router;

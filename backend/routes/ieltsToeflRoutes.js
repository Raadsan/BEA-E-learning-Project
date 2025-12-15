import express from "express";
import {
    getAllIeltsStudents,
    createIeltsStudent,
    getIeltsStudent,
    updateIeltsStudent,
    deleteIeltsStudent
} from "../controllers/ieltsToeflController.js";

const router = express.Router();

router.get("/", getAllIeltsStudents);
router.post("/", createIeltsStudent);
router.get("/:id", getIeltsStudent);
router.put("/:id", updateIeltsStudent);
router.delete("/:id", deleteIeltsStudent);

export default router;

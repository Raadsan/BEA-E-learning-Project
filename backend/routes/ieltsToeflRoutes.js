import express from "express";
import {
    getAllIeltsStudents,
    createIeltsStudent,
    getIeltsStudent,
    updateIeltsStudent,
    deleteIeltsStudent,
    rejectIeltsStudent,
    approveIeltsStudent,
    extendIeltsDeadline,
    assignIeltsClass
} from "../controllers/ieltsToeflController.js";

const router = express.Router();

router.get("/", getAllIeltsStudents);
router.post("/", createIeltsStudent);
router.get("/:id", getIeltsStudent);
router.put("/:id", updateIeltsStudent);
router.post("/reject/:id", rejectIeltsStudent);
router.post("/approve/:id", approveIeltsStudent);
router.post("/extend-deadline/:id", extendIeltsDeadline);
router.post("/assign-class/:id", assignIeltsClass);
router.delete("/:id", deleteIeltsStudent);

export default router;

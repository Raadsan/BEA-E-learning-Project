import express from "express";
import { getNews, createNews, updateNews, deleteNews } from "../controllers/newsController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getNews);
router.post("/", verifyToken, isAdmin, createNews);
router.put("/:id", verifyToken, isAdmin, updateNews);
router.delete("/:id", verifyToken, isAdmin, deleteNews);

export default router;

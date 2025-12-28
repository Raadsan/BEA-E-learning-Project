import express from "express";
import {
    getNews,
    createNews,
    updateNews,
    deleteNews
} from "../controllers/newsController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
    // console.log(`📥 GET /api/news`); // Uncomment for debugging
    next();
}, getNews);

router.post("/", (req, res, next) => {
    // console.log(`📥 POST /api/news`);
    next();
}, createNews);

router.post("/update/:id", (req, res, next) => {
    // console.log(`📥 POST /api/news/update/${req.params.id}`);
    next();
}, updateNews);

router.delete("/:id", (req, res, next) => {
    // console.log(`📥 DELETE /api/news/${req.params.id}`);
    next();
}, deleteNews);

export default router;

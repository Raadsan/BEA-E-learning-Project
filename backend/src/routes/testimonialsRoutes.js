import express from "express";
import TestimonialsController from "../controllers/testimonialsController.js";
import { verifyToken, isAdmin } from "../controllers/authController.js";

const router = express.Router();

router.get("/", TestimonialsController.getTestimonials);
router.get("/admin", verifyToken, isAdmin, TestimonialsController.getTestimonialsAdmin);
router.post("/", verifyToken, isAdmin, TestimonialsController.createTestimonial);
router.put("/:id", verifyToken, isAdmin, TestimonialsController.updateTestimonial);
router.delete("/:id", verifyToken, isAdmin, TestimonialsController.deleteTestimonial);

export default router;

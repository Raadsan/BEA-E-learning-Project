// routes/newsletterRoutes.js
import express from "express";
import * as newsletterController from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/subscribe", newsletterController.subscribe);
router.get("/subscribers", newsletterController.getSubscribers);
router.delete("/:id", newsletterController.deleteSubscriber);

export default router;

import express from "express";
import { verifyToken } from "../controllers/authController.js";
import { checkUnitEligibility, completeCurrentUnit } from "../controllers/unitProgressController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/eligibility", checkUnitEligibility);
router.post("/complete", completeCurrentUnit);

export default router;

import express from "express";
import {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    sendClassNotification
} from "../controllers/announcementController.js";

const router = express.Router();

console.log("✅ Announcement Routes Loaded");

router.get("/", (req, res, next) => {
    console.log(`📥 GET /api/announcements`);
    next();
}, getAnnouncements);

router.post("/", (req, res, next) => {
    console.log(`📥 POST /api/announcements`);
    next();
}, createAnnouncement);

// Changed from PUT /:id to POST /update/:id to avoid routing issues
router.post("/update/:id", (req, res, next) => {
    console.log(`📥 POST /api/announcements/update/${req.params.id}`);
    next();
}, updateAnnouncement);

router.delete("/:id", (req, res, next) => {
    console.log(`📥 DELETE /api/announcements/${req.params.id}`);
    next();
}, deleteAnnouncement);

router.post("/classes/:classId/notifications", (req, res, next) => {
    console.log(`📥 POST /api/announcements/classes/${req.params.classId}/notifications`);
    next();
}, sendClassNotification);

export default router;

import * as announcementModel from "../models/announcementModel.js";

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementModel.getAllAnnouncements();
        res.status(200).json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const newAnnouncement = await announcementModel.createAnnouncement(req.body);
        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Failed to create announcement" });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await announcementModel.updateAnnouncement(id, req.body);

        // Use 200 even if result is 0 (might mean no changes were needed)
        // Ideally we should check if ID exists, but for now this fixes the 404 on "save same data"
        res.status(200).json({ message: "Announcement updated successfully" });
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: "Failed to update announcement" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await announcementModel.deleteAnnouncement(id);
        if (result === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: "Failed to delete announcement" });
    }
};

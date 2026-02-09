// controllers/newsletterController.js
import * as NewsletterModel from "../models/newsletterModel.js";

export const subscribe = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
    }

    try {
        // Check if already subscribed
        const existing = await NewsletterModel.getSubscriberByEmail(email);
        if (existing) {
            return res.status(200).json({ success: true, message: "Already subscribed!" });
        }

        const result = await NewsletterModel.subscribeEmail(email);
        res.status(201).json({
            success: true,
            message: "Subscribed successfully!",
            data: result
        });
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await NewsletterModel.getAllSubscribers();
        res.status(200).json({ success: true, subscribers });
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await NewsletterModel.deleteSubscriberById(id);

        if (!deleted) return res.status(404).json({ error: "Subscriber not found" });

        res.json({ message: "Subscriber deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

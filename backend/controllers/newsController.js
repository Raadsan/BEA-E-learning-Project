import * as newsModel from "../models/newsModel.js";

// GET all news
export const getNews = async (req, res) => {
    try {
        const showAll = req.query.all === 'true';
        const news = await newsModel.getAllNews(!showAll);
        res.status(200).json(news);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ message: "Failed to fetch news" });
    }
};

// CREATE news
export const createNews = async (req, res) => {
    try {
        const { title, description, event_date, type, status } = req.body;
        if (!title || !event_date) {
            return res.status(400).json({ message: "Title and Event Date are required" });
        }
        const newNews = await newsModel.createNews({ title, description, event_date, type, status });
        res.status(201).json(newNews);
    } catch (error) {
        console.error("Error creating news:", error);
        res.status(500).json({ message: "Failed to create news" });
    }
};

// UPDATE news
export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRows = await newsModel.updateNews(id, req.body);
        if (updatedRows === 0) {
            return res.status(404).json({ message: "News/Event not found or no changes made" });
        }
        res.status(200).json({ message: "News/Event updated successfully" });
    } catch (error) {
        console.error("Error updating news:", error);
        res.status(500).json({ message: "Failed to update news" });
    }
};

// DELETE news
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRows = await newsModel.deleteNews(id);
        if (deletedRows === 0) {
            return res.status(404).json({ message: "News/Event not found" });
        }
        res.status(200).json({ message: "News/Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).json({ message: "Failed to delete news" });
    }
};

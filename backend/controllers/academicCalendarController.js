import * as academicCalendarModel from '../models/academicCalendarModel.js';

// Get calendar for a subprogram
export const getCalendar = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        if (!subprogramId) {
            return res.status(400).json({ error: "Subprogram ID is required" });
        }

        const calendar = await academicCalendarModel.getCalendarBySubprogram(subprogramId);
        res.status(200).json(calendar);
    } catch (error) {
        console.error("Error fetching academic calendar:", error);
        res.status(500).json({ error: "Failed to fetch calendar" });
    }
};

// Create a new calendar entry
export const createEntry = async (req, res) => {
    try {
        const {
            program_id,
            subprogram_id,
            week_number,
            day_of_week,
            activity_type,
            activity_title,
            activity_description
        } = req.body;

        if (!program_id || !subprogram_id || !week_number || !day_of_week || !activity_type || !activity_title) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        const newEntry = await academicCalendarModel.createCalendarEntry({
            program_id,
            subprogram_id,
            week_number,
            day_of_week,
            activity_type,
            activity_title,
            activity_description: activity_description || null
        });

        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Error creating calendar entry:", error);
        res.status(500).json({ error: "Failed to create calendar entry" });
    }
};

// Update a calendar entry
export const updateEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { week_number, day_of_week, activity_type, activity_title, activity_description } = req.body;

        const updated = await academicCalendarModel.updateCalendarEntry(id, {
            week_number,
            day_of_week,
            activity_type,
            activity_title,
            activity_description
        });

        if (!updated) {
            return res.status(404).json({ error: "Entry not found or no changes made" });
        }

        res.status(200).json({ message: "Calendar entry updated successfully" });
    } catch (error) {
        console.error("Error updating calendar entry:", error);
        res.status(500).json({ error: "Failed to update calendar entry" });
    }
};

// Delete a calendar entry
export const deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await academicCalendarModel.deleteCalendarEntry(id);

        if (!deleted) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.status(200).json({ message: "Calendar entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting calendar entry:", error);
        res.status(500).json({ error: "Failed to delete calendar entry" });
    }
};

// Bulk create calendar entries
export const bulkCreate = async (req, res) => {
    try {
        const { entries } = req.body;

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: "Entries array is required" });
        }

        const result = await academicCalendarModel.bulkCreateCalendarEntries(entries);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error bulk creating calendar entries:", error);
        res.status(500).json({ error: "Failed to bulk create entries" });
    }
};

// Delete all entries for a subprogram
export const deleteAllBySubprogram = async (req, res) => {
    try {
        const { subprogramId } = req.params;

        const deleted = await academicCalendarModel.deleteAllBySubprogram(subprogramId);
        res.status(200).json({
            message: "All calendar entries deleted successfully",
            count: deleted
        });
    } catch (error) {
        console.error("Error deleting calendar entries:", error);
        res.status(500).json({ error: "Failed to delete entries" });
    }
};

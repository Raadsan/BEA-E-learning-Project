import * as timetableModel from '../models/timetableModel.js';

// Get timetable for a subprogram
export const getTimetable = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        if (!subprogramId) {
            return res.status(400).json({ error: "Subprogram ID is required" });
        }

        const timetable = await timetableModel.getTimetableBySubprogram(subprogramId);
        res.status(200).json(timetable);
    } catch (error) {
        console.error("Error fetching timetable:", error);
        res.status(500).json({ error: "Failed to fetch timetable" });
    }
};

// Create a new timetable entry
export const createEntry = async (req, res) => {
    try {
        const { program_id, subprogram_id, date, day, start_time, end_time, subject, teacher_id, type } = req.body;

        if (!program_id || !subprogram_id || !day || !start_time || !end_time || !subject) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        const newEntry = await timetableModel.createTimetableEntry({
            program_id,
            subprogram_id,
            date: date || null,
            day,
            start_time,
            end_time,
            subject,
            teacher_id: teacher_id || null,
            type: type || "Class"
        });

        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Error creating timetable entry:", error);
        res.status(500).json({ error: "Failed to create timetable entry" });
    }
};

// Update a timetable entry
export const updateEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, day, start_time, end_time, subject, teacher_id, type } = req.body;

        const updated = await timetableModel.updateTimetableEntry(id, {
            date,
            day,
            start_time,
            end_time,
            subject,
            teacher_id,
            type: type || "Class"
        });

        if (!updated) {
            return res.status(404).json({ error: "Entry not found or no changes made" });
        }

        res.status(200).json({ message: "Timetable entry updated successfully" });
    } catch (error) {
        console.error("Error updating timetable entry:", error);
        res.status(500).json({ error: "Failed to update timetable entry" });
    }
};

// Delete a timetable entry
export const deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await timetableModel.deleteTimetableEntry(id);

        if (!deleted) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.status(200).json({ message: "Timetable entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting timetable entry:", error);
        res.status(500).json({ error: "Failed to delete timetable entry" });
    }
};

// ===== WEEKLY SCHEDULE METHODS (for long-term programs) =====

// Get weekly schedule for a subprogram
export const getWeeklySchedule = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        const { month, year } = req.query;

        if (!subprogramId) {
            return res.status(400).json({ error: "Subprogram ID is required" });
        }

        const schedule = await timetableModel.getWeeklyScheduleBySubprogram(subprogramId, month, year);
        res.status(200).json(schedule);
    } catch (error) {
        console.error("Error fetching weekly schedule:", error);
        res.status(500).json({ error: "Failed to fetch weekly schedule" });
    }
};

// Create a weekly schedule entry
export const createWeeklyEntry = async (req, res) => {
    try {
        const {
            program_id,
            subprogram_id,
            week_number,
            day,
            activity_type,
            activity_title,
            activity_description,
            month,
            year
        } = req.body;

        if (!program_id || !subprogram_id || !week_number || !day || !activity_title) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        const newEntry = await timetableModel.createWeeklyEntry({
            program_id,
            subprogram_id,
            week_number,
            day,
            activity_type: activity_type || "Session",
            activity_title,
            activity_description: activity_description || null,
            month,
            year
        });

        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Error creating weekly entry:", error);
        res.status(500).json({ error: "Failed to create weekly entry" });
    }
};

// Update a weekly schedule entry
export const updateWeeklyEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { week_number, day, activity_type, activity_title, activity_description, month, year } = req.body;

        const updated = await timetableModel.updateWeeklyEntry(id, {
            week_number,
            day,
            activity_type: activity_type || "Session",
            activity_title,
            activity_description,
            month,
            year
        });

        if (!updated) {
            return res.status(404).json({ error: "Entry not found or no changes made" });
        }

        res.status(200).json({ message: "Weekly entry updated successfully" });
    } catch (error) {
        console.error("Error updating weekly entry:", error);
        res.status(500).json({ error: "Failed to update weekly entry" });
    }
};

// Delete a weekly schedule entry
export const deleteWeeklyEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await timetableModel.deleteWeeklyEntry(id);

        if (!deleted) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.status(200).json({ message: "Weekly entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting weekly entry:", error);
        res.status(500).json({ error: "Failed to delete weekly entry" });
    }
};

// Bulk create weekly entries
export const bulkCreateWeeklyEntries = async (req, res) => {
    try {
        const { entries } = req.body;

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: "Entries array is required" });
        }

        const result = await timetableModel.bulkCreateWeeklyEntries(entries);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error bulk creating weekly entries:", error);
        res.status(500).json({ error: "Failed to bulk create entries" });
    }
};

// Delete all weekly entries for a subprogram
export const deleteAllWeeklyBySubprogram = async (req, res) => {
    try {
        const { subprogramId } = req.params;

        const deleted = await timetableModel.deleteAllWeeklyBySubprogram(subprogramId);
        res.status(200).json({
            message: "All weekly entries deleted successfully",
            count: deleted
        });
    } catch (error) {
        console.error("Error deleting weekly entries:", error);
        res.status(500).json({ error: "Failed to delete entries" });
    }
};


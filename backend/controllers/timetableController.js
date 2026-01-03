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
        const { program_id, subprogram_id, day, start_time, end_time, subject, teacher_id, type } = req.body;

        if (!program_id || !subprogram_id || !day || !start_time || !end_time || !subject) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        const newEntry = await timetableModel.createTimetableEntry({
            program_id,
            subprogram_id,
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
        const { day, start_time, end_time, subject, teacher_id, type } = req.body;

        const updated = await timetableModel.updateTimetableEntry(id, {
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

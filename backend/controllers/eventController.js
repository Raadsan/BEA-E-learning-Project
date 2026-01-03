import * as Event from '../models/eventModel.js';

// Get events for a subprogram
export const getEvents = async (req, res) => {
    try {
        const { subprogramId } = req.params;
        const { start, end } = req.query; // Expecting YYYY-MM-DD

        if (!start || !end) {
            return res.status(400).json({ error: "Start and End dates are required" });
        }

        const events = await Event.getEventsBySubprogram(subprogramId, start, end);
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
};

// Create a new event
export const createEvent = async (req, res) => {
    try {
        const { subprogram_id, event_date, type, title, description } = req.body;

        if (!subprogram_id || !event_date || !title) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const id = await Event.createEvent({ subprogram_id, event_date, type, title, description });
        res.status(201).json({ id, message: "Event created successfully" });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
};

// Update an event
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { event_date, type, title, description } = req.body;

        const success = await Event.updateEvent(id, { event_date, type, title, description });
        if (!success) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event updated successfully" });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event" });
    }
};

// Delete an event
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Event.deleteEvent(id);

        if (!success) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
};

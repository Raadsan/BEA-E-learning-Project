import CourseTimelineModel from '../models/courseTimelineModel.js';

// Helper function to format date from DD/MM/YYYY to YYYY-MM-DD
const formatDateForDB = (dateString) => {
    if (!dateString) return null;

    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // If in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
};

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

// Validate date format and logic
const validateDates = (start_date, end_date) => {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime())) {
        return { valid: false, error: 'Invalid start date format' };
    }

    if (isNaN(endDate.getTime())) {
        return { valid: false, error: 'Invalid end date format' };
    }

    if (startDate >= endDate) {
        return { valid: false, error: 'Start date must be before end date' };
    }

    return { valid: true };
};

const CourseTimelineController = {
    // GET all timelines (public endpoint for website)
    async getTimelines(req, res) {
        try {
            const timelines = await CourseTimelineModel.getAllTimelines();

            // Format dates for display
            const formattedTimelines = timelines.map(timeline => ({
                ...timeline,
                start_date: formatDateForDisplay(timeline.start_date),
                end_date: formatDateForDisplay(timeline.end_date),
                startDate: formatDateForDisplay(timeline.start_date), // For backward compatibility
                endDate: formatDateForDisplay(timeline.end_date),
                termSerial: timeline.term_serial
            }));

            res.json(formattedTimelines);
        } catch (error) {
            console.error('Error fetching timelines:', error);
            // Return empty array instead of error if table exists but is empty
            res.json([]);
        }
    },

    // GET all timelines including inactive (admin only)
    async getTimelinesAdmin(req, res) {
        try {
            const timelines = await CourseTimelineModel.getAllTimelinesAdmin();

            // Format dates for display
            const formattedTimelines = timelines.map(timeline => ({
                ...timeline,
                start_date_display: formatDateForDisplay(timeline.start_date),
                end_date_display: formatDateForDisplay(timeline.end_date)
            }));

            res.json(formattedTimelines);
        } catch (error) {
            console.error('Error fetching timelines (admin):', error);
            // Return empty array instead of error if table exists but is empty
            res.json([]);
        }
    },

    // GET timeline by ID (admin only)
    async getTimelineById(req, res) {
        try {
            const { id } = req.params;
            const timeline = await CourseTimelineModel.getTimelineById(id);

            if (!timeline) {
                return res.status(404).json({ error: 'Timeline not found' });
            }

            res.json(timeline);
        } catch (error) {
            console.error('Error fetching timeline by ID:', error);
            res.status(500).json({ error: 'Failed to fetch timeline' });
        }
    },

    // POST create new timeline (admin only)
    async createTimeline(req, res) {
        try {
            const { term_serial, start_date, end_date, holidays } = req.body;

            // Validation
            if (!term_serial || !start_date || !end_date) {
                return res.status(400).json({ error: 'Term serial, start date, and end date are required' });
            }

            // Check if term_serial already exists
            const exists = await CourseTimelineModel.termSerialExists(term_serial);
            if (exists) {
                return res.status(400).json({ error: 'Term serial already exists' });
            }

            // Format dates
            const formattedStartDate = formatDateForDB(start_date);
            const formattedEndDate = formatDateForDB(end_date);

            if (!formattedStartDate || !formattedEndDate) {
                return res.status(400).json({ error: 'Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD' });
            }

            // Validate dates
            const dateValidation = validateDates(formattedStartDate, formattedEndDate);
            if (!dateValidation.valid) {
                return res.status(400).json({ error: dateValidation.error });
            }

            // Get next display order
            const display_order = await CourseTimelineModel.getNextDisplayOrder();

            // Create timeline
            const timelineId = await CourseTimelineModel.createTimeline({
                term_serial,
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                holidays,
                display_order
            });

            res.status(201).json({
                message: 'Timeline created successfully',
                id: timelineId
            });
        } catch (error) {
            console.error('Error creating timeline:', error);
            res.status(500).json({ error: 'Failed to create timeline' });
        }
    },

    // PUT update timeline (admin only)
    async updateTimeline(req, res) {
        try {
            const { id } = req.params;
            const { term_serial, start_date, end_date, holidays, display_order, is_active } = req.body;

            // Check if timeline exists
            const existing = await CourseTimelineModel.getTimelineById(id);
            if (!existing) {
                return res.status(404).json({ error: 'Timeline not found' });
            }

            // Validation
            if (!term_serial || !start_date || !end_date) {
                return res.status(400).json({ error: 'Term serial, start date, and end date are required' });
            }

            // Check if term_serial already exists (excluding current record)
            const exists = await CourseTimelineModel.termSerialExists(term_serial, id);
            if (exists) {
                return res.status(400).json({ error: 'Term serial already exists' });
            }

            // Format dates
            const formattedStartDate = formatDateForDB(start_date);
            const formattedEndDate = formatDateForDB(end_date);

            if (!formattedStartDate || !formattedEndDate) {
                return res.status(400).json({ error: 'Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD' });
            }

            // Validate dates
            const dateValidation = validateDates(formattedStartDate, formattedEndDate);
            if (!dateValidation.valid) {
                return res.status(400).json({ error: dateValidation.error });
            }

            // Update timeline
            const success = await CourseTimelineModel.updateTimeline(id, {
                term_serial,
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                holidays,
                display_order: display_order || existing.display_order,
                is_active: is_active !== undefined ? is_active : existing.is_active
            });

            if (success) {
                res.json({ message: 'Timeline updated successfully' });
            } else {
                res.status(500).json({ error: 'Failed to update timeline' });
            }
        } catch (error) {
            console.error('Error updating timeline:', error);
            res.status(500).json({ error: 'Failed to update timeline' });
        }
    },

    // DELETE timeline (admin only)
    async deleteTimeline(req, res) {
        try {
            const { id } = req.params;

            // Check if timeline exists
            const existing = await CourseTimelineModel.getTimelineById(id);
            if (!existing) {
                return res.status(404).json({ error: 'Timeline not found' });
            }

            // Hard delete
            const success = await CourseTimelineModel.hardDeleteTimeline(id);

            if (success) {
                res.json({ message: 'Timeline deleted successfully' });
            } else {
                res.status(500).json({ error: 'Failed to delete timeline' });
            }
        } catch (error) {
            console.error('Error deleting timeline:', error);
            res.status(500).json({ error: 'Failed to delete timeline' });
        }
    },

    // PUT reorder timelines (admin only)
    async reorderTimelines(req, res) {
        try {
            const { orderData } = req.body;

            if (!Array.isArray(orderData) || orderData.length === 0) {
                return res.status(400).json({ error: 'Invalid order data' });
            }

            await CourseTimelineModel.reorderTimelines(orderData);
            res.json({ message: 'Timelines reordered successfully' });
        } catch (error) {
            console.error('Error reordering timelines:', error);
            res.status(500).json({ error: 'Failed to reorder timelines' });
        }
    }
};

export default CourseTimelineController;

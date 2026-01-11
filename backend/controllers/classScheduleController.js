// controllers/classScheduleController.js
import * as ClassScheduleModel from "../models/classScheduleModel.js";

export const createClassSchedule = async (req, res) => {
    try {
        const { class_id } = req.params;
        const { session_title, zoom_link, schedule_date, start_time, end_time } = req.body;

        // Support bulk create if body is array (optional, based on frontend)
        if (Array.isArray(req.body)) {
            const results = await Promise.all(req.body.map(item =>
                ClassScheduleModel.createClassSchedule({ ...item, class_id })
            ));
            return res.status(201).json({ message: "Schedules created", ids: results });
        }

        const id = await ClassScheduleModel.createClassSchedule({
            class_id, session_title, zoom_link, schedule_date, start_time, end_time
        });
        res.status(201).json({ id, message: "Schedule created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getClassSchedules = async (req, res) => {
    try {
        const { class_id } = req.params;
        const schedules = await ClassScheduleModel.getClassSchedulesByClassId(class_id);
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllClassSchedules = async (req, res) => {
    try {
        const schedules = await ClassScheduleModel.getAllClassSchedules();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateClassSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await ClassScheduleModel.updateClassSchedule(id, req.body);
        res.status(200).json({ message: "Schedule updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteClassSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await ClassScheduleModel.deleteClassSchedule(id);
        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStudentSchedules = async (req, res) => {
    try {
        const student_id = req.user.id; // From verifyToken
        const schedules = await ClassScheduleModel.getStudentSchedules(student_id);
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

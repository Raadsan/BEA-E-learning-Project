// controllers/classScheduleController.js
import * as ClassSchedule from "../models/classScheduleModel.js";

// CREATE class schedule
export const createClassSchedule = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { schedule_date, zoom_link, start_time, end_time, title } = req.body;

    if (!class_id || !schedule_date) {
      return res.status(400).json({ error: "Class ID and schedule date are required" });
    }

    const scheduleItem = await ClassSchedule.createClassSchedule({
      class_id,
      schedule_date,
      zoom_link,
      start_time,
      end_time,
      title
    });

    res.status(201).json({ message: "Class schedule created", schedule: scheduleItem });
  } catch (err) {
    console.error("❌ Create class schedule error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET all schedules for a class
export const getClassSchedules = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schedules = await ClassSchedule.getClassSchedules(class_id);
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE class schedule
export const updateClassSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ClassSchedule.getScheduleById(id);

    if (!existing) return res.status(404).json({ error: "Schedule not found" });

    await ClassSchedule.updateClassSchedule(id, req.body);

    const updated = await ClassSchedule.getScheduleById(id);
    res.json({ message: "Updated", schedule: updated });
  } catch (err) {
    console.error("Update class schedule error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DELETE class schedule
export const deleteClassSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await ClassSchedule.deleteClassSchedule(id);
    res.json({ message: "Class schedule deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET schedules for student's classes (calendar view)
export const getStudentSchedules = async (req, res) => {
  try {
    const { userId } = req.user; // Student ID from JWT

    const schedules = await ClassSchedule.getSchedulesForStudent(userId);
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
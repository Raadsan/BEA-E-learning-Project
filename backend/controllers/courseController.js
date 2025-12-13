// controllers/courseController.js
import * as Course from "../models/courseModel.js";

// CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    const { course_title, subprogram_id, description, duration, price } = req.body;

    if (!course_title || !subprogram_id) {
      return res.status(400).json({ error: "Course title and subprogram ID are required" });
    }

    const course = await Course.createCourse({
      course_title,
      subprogram_id,
      description,
      duration,
      price
    });

    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error("❌ Create course error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET ALL COURSES
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET COURSES BY SUBPROGRAM ID
export const getCoursesBySubprogramId = async (req, res) => {
  try {
    const { subprogram_id } = req.params;
    const courses = await Course.getCoursesBySubprogramId(subprogram_id);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET SINGLE COURSE
export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.getCourseById(id);

    if (!course) return res.status(404).json({ error: "Not found" });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Course.getCourseById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Course.updateCourseById(id, req.body);

    const updated = await Course.getCourseById(id);
    res.json({ message: "Updated", course: updated });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DELETE COURSE
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Course.getCourseById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Course.deleteCourseById(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


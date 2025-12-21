import * as Course from "../models/courseModel.js";

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

// GET COURSE BY ID
export const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.getCourseById(id);
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// CREATE COURSE
export const createCourse = async (req, res) => {
    try {
        const newCourse = await Course.createCourse(req.body);
        res.status(201).json(newCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Course.updateCourseById(id, req.body);
        res.json({ message: "Course updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// DELETE COURSE
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Course.deleteCourseById(id);
        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

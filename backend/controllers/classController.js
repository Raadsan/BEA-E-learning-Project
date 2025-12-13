// controllers/classController.js
import * as Class from "../models/classModel.js";

// CREATE CLASS
export const createClass = async (req, res) => {
  try {
    const { class_name, description } = req.body;

    if (!class_name) {
      return res.status(400).json({ error: "Class name is required" });
    }

    const classItem = await Class.createClass({
      class_name,
      description
    });

    res.status(201).json({ message: "Class created", class: classItem });
  } catch (err) {
    console.error("❌ Create class error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET ALL CLASSES
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.getAllClasses();
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET CLASSES BY COURSE ID
export const getClassesByCourseId = async (req, res) => {
  try {
    const { course_id } = req.params;
    const classes = await Class.getClassesByCourseId(course_id);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Note: getClassesByTeacherId removed - teacher_id no longer exists in classes table

// GET SINGLE CLASS
export const getClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = await Class.getClassById(id);

    if (!classItem) return res.status(404).json({ error: "Not found" });

    res.json(classItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE CLASS
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Class.getClassById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Class.updateClassById(id, req.body);

    const updated = await Class.getClassById(id);
    res.json({ message: "Updated", class: updated });
  } catch (err) {
    console.error("Update class error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DELETE CLASS
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Class.getClassById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Class.deleteClassById(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// controllers/teacherController.js
import * as Teacher from "../models/teacherModel.js";
import bcrypt from "bcryptjs";

// CREATE TEACHER
export const createTeacher = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      country,
      city,
      specialization,
      highest_qualification,
      years_experience,
      bio,
      portfolio_link,
      skills,
      hire_date,
      password
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required" });
    }

    // Check if email already exists
    const existingTeacher = await Teacher.getTeacherByEmail(email);
    if (existingTeacher) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.createTeacher({
      full_name,
      email,
      phone,
      country,
      city,
      specialization,
      highest_qualification,
      years_experience,
      bio,
      portfolio_link,
      skills,
      hire_date,
      password: hashedPassword
    });

    // Don't send password in response
    const { password: _, ...teacherResponse } = teacher;
    res.status(201).json({ message: "Teacher created", teacher: teacherResponse });
  } catch (err) {
    console.error("❌ Create teacher error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET ALL TEACHERS
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.getAllTeachers();
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET SINGLE TEACHER
export const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.getTeacherById(id);

    if (!teacher) return res.status(404).json({ error: "Not found" });

    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE TEACHER
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Teacher.getTeacherById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    const updateData = { ...req.body };

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await Teacher.updateTeacherById(id, updateData);

    const updated = await Teacher.getTeacherById(id);
    res.json({ message: "Updated", teacher: updated });
  } catch (err) {
    console.error("Update teacher error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DELETE TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Teacher.getTeacherById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Teacher.deleteTeacherById(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


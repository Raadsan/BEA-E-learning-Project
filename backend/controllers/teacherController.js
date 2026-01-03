// controllers/teacherController.js
import * as Teacher from "../models/teacherModel.js";
import * as Class from "../models/classModel.js";

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

    // No hashing, use plain text as requested
    const hashedPassword = password;

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

    // No hashing, use plain text as requested

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

// GET TEACHER DASHBOARD STATS
export const getTeacherDashboardStats = async (req, res) => {
  try {
    // req.user is populated by verifyToken middleware
    const teacherId = req.user.userId;

    // Ensure the user is actually a teacher if needed, or just trust the ID from token
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied. Teachers only." });
    }

    const stats = await Teacher.getTeacherStatsById(teacherId);
    res.json(stats);
  } catch (err) {
    console.error("❌ Get teacher stats error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET TEACHER CLASSES
export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied. Teachers only." });
    }

    const classes = await Class.getClassesByTeacherId(teacherId);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET TEACHER PROGRAMS
export const getTeacherPrograms = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied. Teachers only." });
    }

    // You need to import getProgramsByTeacherId from model. I'll add the import line at the top in a separate edit or verify it is imported.
    // Wait, I only imported "Teacher" as * from teacherModel. 
    // I need to import Program model or add getProgramsByTeacherId to Teacher model?
    // User requested "programs isticmal", so logically it belongs in Program model, but I need to call it here.
    // I should import Program model at the top. 
    // Since I cannot do multiple edits easily without multi_tool, I will assume I can access it if I import it.
    // Actually, I should probably put this method in programController? No, it's specific to "Me" as a teacher.
    // Let's stick to teacherController but I need to update imports.

    // I'll return a placeholder first, then update imports. 
    // Or better: Just use dynamic import? No, bad practice.
    // I'll just write the function assuming `Program.getProgramsByTeacherId` works after I update imports.
    // Note: I haven't imported Program model yet. I will do that in next step.

    // Changing plan: I will add the method here, then I will update the imports at top of file.

    const programs = await import("../models/programModel.js").then(m => m.getProgramsByTeacherId(teacherId));
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { validateEmailRobust } from '../utils/emailValidator.js';
import { validatePassword, passwordPolicyMessage } from '../utils/passwordValidator.js';

// CREATE TEACHER
export const createTeacher = async (req, res) => {
  try {
    const {
      full_name, email, phone, country, city, specialization,
      highest_qualification, years_experience, bio, portfolio_link,
      skills, hire_date, password
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required" });
    }

    const emailStr = email.trim().toLowerCase();

    // Deep Email Validation
    const emailValidationResult = await validateEmailRobust(emailStr);

    if (!emailValidationResult.valid) {
        return res.status(400).json({ error: emailValidationResult.message || "Invalid email address. Please provide a real and working email." });
    }

    const existing = await prisma.teachers.findUnique({ where: { email: emailStr } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await prisma.teachers.create({
      data: {
        full_name, email: emailStr, phone, country, city, specialization,
        highest_qualification, 
        years_experience: years_experience ? parseInt(years_experience) : null,
        bio, portfolio_link, skills,
        hire_date: hire_date ? new Date(hire_date) : null,
        password: hashedPassword
      }
    });

    const { password: _, ...response } = teacher;
    res.status(201).json({ message: "Teacher created", teacher: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL TEACHERS
export const getTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teachers.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE TEACHER
export const getTeacher = async (req, res) => {
  try {
    const teacher = await prisma.teachers.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!teacher) return res.status(404).json({ error: "Not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE TEACHER
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.teachers.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const data = { ...req.body };
    if (req.file) data.profile_picture = `/uploads/${req.file.filename}`;
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    if (data.years_experience) data.years_experience = parseInt(data.years_experience);
    if (data.hire_date) data.hire_date = new Date(data.hire_date);

    const updated = await prisma.teachers.update({
      where: { id: parseInt(id) },
      data
    });
    res.json({ message: "Updated", teacher: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    await prisma.teachers.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET TEACHER CLASSES
export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const classes = await prisma.classes.findMany({
      where: { teacher_id: parseInt(teacherId) },
      include: { subprograms: true }
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BULK ACTION TEACHERS
export const bulkActionTeachers = async (req, res) => {
  const { teacherIds, action } = req.body;
  if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
    return res.status(400).json({ error: "Teacher IDs must be a non-empty array" });
  }
  if (!['activate', 'deactivate', 'delete'].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const teacherId of teacherIds) {
        const numericId = parseInt(teacherId, 10);
        if (isNaN(numericId)) continue;

        if (action === 'delete') {
          await tx.teachers.delete({ where: { id: numericId } });
        } else {
          await tx.teachers.update({
            where: { id: numericId },
            data: { status: action === 'activate' ? 'active' : 'inactive' }
          });
        }
      }
    });
    res.json({ message: `Bulk action ${action} completed successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


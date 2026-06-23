import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { getStoredFileUrl } from '../utils/fileStorage.js';
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
    if (req.file) data.profile_picture = getStoredFileUrl(req.file);
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
      include: {
        subprograms: {
          include: {
            programs: true
          }
        },
        _count: { select: { students: true } }
      }
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

// GET TEACHER DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const teacherId = parseInt(req.user.userId);
    const { month, year } = req.query;

    // Fetch teacher info
    const teacher = await prisma.teachers.findUnique({ where: { id: teacherId } });

    // Get classes assigned to this teacher
    const classes = await prisma.classes.findMany({
      where: { teacher_id: teacherId },
      include: { subprograms: { include: { programs: true } } }
    });

    const classIds = classes.map(c => c.id);

    // Total students across all teacher's classes
    const students = classIds.length > 0
      ? await prisma.students.findMany({ where: { class_id: { in: classIds } } })
      : [];

    const totalStudents = students.length;

    // Unique programs
    const programSet = new Set();
    classes.forEach(c => { if (c.subprograms?.programs?.id) programSet.add(c.subprograms.programs.id); });
    const totalPrograms = programSet.size;

    // Build weekly attendance data for current month/year
    const now = new Date();
    const targetMonth = parseInt(month) || (now.getMonth() + 1);
    const targetYear = parseInt(year) || now.getFullYear();

    // Generate day-of-week breakdown from attendance records this month
    const firstDay = new Date(targetYear, targetMonth - 1, 1);
    const lastDay = new Date(targetYear, targetMonth, 0);

    const attendanceRecords = classIds.length > 0
      ? await prisma.attendance.findMany({
          where: {
            class_id: { in: classIds },
            date: { gte: firstDay, lte: lastDay }
          }
        })
      : [];

    // Aggregate per week-day label
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekMap = {};
    attendanceRecords.forEach(rec => {
      const d = new Date(rec.date);
      const label = dayNames[d.getDay()];
      if (!weekMap[label]) weekMap[label] = { day: label, thisWeek: 0, lastWeek: 0 };
      const isPresent = (rec.hour1 || 0) + (rec.hour2 || 0) > 0;
      // Rough split: records in the 2nd half of the month → thisWeek, 1st half → lastWeek
      if (d.getDate() > 15) weekMap[label].thisWeek += isPresent ? 1 : 0;
      else weekMap[label].lastWeek += isPresent ? 1 : 0;
    });
    const weeklyAttendance = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
      weekMap[day] || { day, thisWeek: 0, lastWeek: 0 }
    );

    // Per-class attendance breakdown for pie chart
    const classAttendanceData = await Promise.all(classes.map(async (cls) => {
      const recs = await prisma.attendance.findMany({
        where: { class_id: cls.id, date: { gte: firstDay, lte: lastDay } }
      });
      const attended = recs.filter(r => (r.hour1 || 0) + (r.hour2 || 0) > 0).length;
      const absent = recs.length - attended;
      return { className: cls.class_name, attended, absent };
    }));

    res.json({
      fullName: teacher?.full_name || 'Teacher',
      totalClasses: classes.length,
      totalStudents,
      activeStudents: totalStudents,
      totalPrograms,
      studentGrowth: 0,
      weeklyAttendance,
      classAttendanceData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET TEACHER PROGRAMS
export const getTeacherPrograms = async (req, res) => {
  try {
    const teacherId = parseInt(req.user.userId);
    const classes = await prisma.classes.findMany({
      where: { teacher_id: teacherId },
      include: { subprograms: { include: { programs: true } } }
    });

    const programMap = {};
    classes.forEach(c => {
      const prog = c.subprograms?.programs;
      if (prog) programMap[prog.id] = prog;
    });

    res.json(Object.values(programMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



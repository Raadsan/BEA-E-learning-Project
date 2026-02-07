import * as Student from "../models/studentModel.js";
import { createPayment } from '../models/paymentModel.js';
import bcrypt from "bcryptjs";
import { validatePassword, passwordPolicyMessage } from "../utils/passwordValidator.js";
import { sendWaafiPayment } from "../utils/waafiPayment.js";
import db from "../database/dbconfig.js";

const dbp = db.promise();

// CREATE STUDENT
export const createStudent = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      age,
      residency_country,
      residency_city,
      chosen_program,
      chosen_subprogram,
      password,
      parent_name,
      parent_email,
      parent_phone,
      parent_relation,
      parent_res_county,
      parent_res_city,
      class_id,
      sex,
      funding_status,
      sponsorship_package,
      funding_amount,
      funding_month,
      scholarship_percentage,
      gender,
      date_of_birth,
      place_of_birth
    } = req.body;

    const studentSex = sex || gender;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Full name, email, and password are required"
      });
    }


    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }

    // Check if email already exists for THIS program
    const existingStudents = await Student.getAllStudents();
    const alreadyRegistered = existingStudents.find(s => s.email === email && s.chosen_program === chosen_program);

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        error: `You are already registered for the ${chosen_program} program.`
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial paid_until calculation
    let initialPaidUntil = null;
    if (funding_status && funding_status !== 'Unpaid') {
      const now = new Date();
      initialPaidUntil = new Date(now.setDate(now.getDate() + 30));
    }

    // Set 24-hour expiry window for placement test
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    // Secure Backend Waafi Payment Processing
    let transactionId = null;
    let paymentStatus = 'Pending';
    let waafiRawResponse = null;

    const paymentAmount = req.body.payment?.amount ? parseFloat(req.body.payment.amount) : 0;

    if (req.body.payment && req.body.payment.method === 'waafi' && paymentAmount > 0) {
      const waafiResponse = await sendWaafiPayment({
        transactionId: `REG-${Date.now()}`,
        accountNo: req.body.payment.payerPhone || req.body.payment.accountNumber,
        amount: paymentAmount,
        description: `Registration: ${chosen_program}`
      });

      waafiRawResponse = waafiResponse;
      const respCode = waafiResponse?.responseCode || waafiResponse?.code;
      const success = (respCode === '0000' || respCode === '2001' || waafiResponse?.status === 'SUCCESS' || waafiResponse?.serviceParams?.status === 'SUCCESS');

      if (!success) {
        return res.status(400).json({
          success: false,
          error: waafiResponse?.responseMsg || waafiResponse?.message || "Payment failed"
        });
      }

      transactionId = waafiResponse?.serviceParams?.transactionId || waafiResponse?.params?.transactionId || `WAAFI-${Date.now()}`;
      paymentStatus = 'Paid';
    } else if (req.body.payment && paymentAmount === 0) {
      // If fee is 0, bypass payment and confirm immediately
      paymentStatus = 'Paid';
      transactionId = `FREE-${Date.now()}`;
    }

    const student = await Student.createStudent({
      full_name,
      email,
      phone,
      age,
      sex: studentSex,
      residency_country,
      residency_city,
      chosen_program,
      chosen_subprogram,
      password: hashedPassword,
      parent_name,
      parent_email,
      parent_phone,
      parent_relation,
      parent_res_county,
      parent_res_city,
      class_id,
      funding_status: paymentStatus === 'Paid' ? 'Paid' : (funding_status || 'Unpaid'),
      sponsorship_package,
      funding_amount,
      funding_month,
      scholarship_percentage,
      paid_until: initialPaidUntil,
      expiry_date: expiryDate,
      date_of_birth,
      place_of_birth
    });

    console.log('✅ Student created with ID:', student?.student_id);

    // If payment info provided, save payment and set approval_status to 'pending'
    let updatedStudent = student;
    if (paymentStatus === 'Paid' && transactionId) {
      console.log('📝 Syncing payment record...');
      try {
        const paymentData = {
          student_id: student.student_id,
          method: 'waafi',
          provider_transaction_id: transactionId,
          amount: req.body.payment.amount || 0.01,
          currency: 'USD',
          status: 'paid',
          raw_response: { note: 'Registration Fee', ...waafiRawResponse },
          payer_phone: req.body.payment.payerPhone || req.body.payment.accountNumber || null,
          program_id: chosen_program || null
        };

        await createPayment(paymentData);

        // Mark student awaiting admin approval
        await Student.updateStudentById(student.student_id, {
          approval_status: 'pending'
        });
        updatedStudent = await Student.getStudentById(student.student_id);

        // Notify admin that a new paid application is pending approval
        try {
          const nodemailer = await import('nodemailer');
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@bea.com';
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || ''
            }
          });

          const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@bea.com',
            to: adminEmail,
            subject: 'New application pending approval',
            text: `A new student application was submitted and paid. Name: ${updatedStudent.full_name}, Email: ${updatedStudent.email}, Phone: ${updatedStudent.phone}. Please review and approve/reject in the admin portal.`
          };

          // Send email but don't block response
          transporter.sendMail(mailOptions).then(info => {
            console.log('Admin notification sent:', info.messageId);
          }).catch(err => {
            console.error('Failed to send admin notification:', err);
          });
        } catch (err) {
          console.error('Failed to create admin transporter:', err);
        }
      } catch (err) {
        console.error('❌ Error saving payment record:', err);
      }
    } else if (funding_status && funding_status !== 'Unpaid') {
      // Manual creation by admin with a funding status
      console.log('📝 Creating automatic payment record for funding_status:', funding_status);
      try {
        const paymentData = {
          student_id: student.student_id,
          method: funding_status === 'Sponsorship' ? 'sponsorship' : (funding_status.includes('Scholarship') ? 'scholarship' : 'cash/admin'),
          provider_transaction_id: `ADMIN_${Date.now()}`,
          amount: funding_amount || 0,
          currency: 'USD',
          status: funding_status === 'Partial Scholarship' ? 'partial' : 'paid',
          raw_response: { note: `Automatically created for ${funding_status}`, month: funding_month },
          payer_phone: phone || null,
          program_id: null // Admin can update this later if needed
        };

        if (funding_status === 'Full Scholarship') {
          paymentData.amount = 0;
        }

        const payment = await createPayment(paymentData);
        console.log('✅ Automatic payment record created:', payment.id);
      } catch (err) {
        console.error('❌ Error creating automatic payment record:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: updatedStudent
    });
  } catch (err) {
    console.error("❌ Create student error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// GET ALL STUDENTS
export const getStudents = async (req, res) => {
  try {
    const students = await Student.getAllStudents();
    res.json({
      success: true,
      students
    });
  } catch (err) {
    console.error("❌ Get students error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server error"
    });
  }
};

// GET SINGLE STUDENT
export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (err) {
    console.error("❌ Get student error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Student.getStudentById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    // Check if email is being updated and if it already exists
    if (req.body.email && req.body.email !== existing.email) {
      const emailExists = await Student.getStudentByEmail(req.body.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: "Email already exists"
        });
      }
    }

    const updateData = { ...req.body };

    // Handle file upload
    if (req.file) {
      updateData.profile_picture = `/uploads/${req.file.filename}`;
    }

    // Hash password if being updated
    if (updateData.password) {
      if (!validatePassword(updateData.password)) {
        return res.status(400).json({ success: false, error: passwordPolicyMessage });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.confirmPassword;
      delete updateData.password;
    }

    const oldClassId = existing.class_id;
    const newClassId = req.body.class_id;

    await Student.updateStudentById(id, updateData);
    const updated = await Student.getStudentById(id);

    // Track class history and migrate data if applicable
    if (newClassId && newClassId !== oldClassId) {
      const [newClass] = await dbp.query("SELECT * FROM classes WHERE id = ?", [newClassId]);
      const subprogramId = newClass[0]?.subprogram_id;

      // 1. Add to history if not exists
      await dbp.query(
        "INSERT IGNORE INTO student_class_history (student_id, class_id, subprogram_id, is_active) VALUES (?, ?, ?, 1)",
        [id, newClassId, subprogramId]
      );

      // 2. Set other classes of SAME subprogram to inactive
      await dbp.query(
        "UPDATE student_class_history SET is_active = 0 WHERE student_id = ? AND subprogram_id = ? AND class_id != ?",
        [id, subprogramId, newClassId]
      );

      // 3. Migrate assignment submissions ONLY if staying within the SAME subprogram (e.g., class change by admin)
      // If subprogramId (new) != existing.chosen_subprogram (old), we skip migration to preserve old level history.
      const oldSubprogramId = existing.chosen_subprogram || existing.subprogram_id;

      if (oldClassId && subprogramId == oldSubprogramId) {
        console.log(`[Migration] Internal Class change detected: ${oldClassId} → ${newClassId}. Migrating submissions within same level...`);

        const tables = [
          { main: 'exams', sub: 'exam_submissions' },
          { main: 'writing_tasks', sub: 'writing_task_submissions' },
          { main: 'course_work', sub: 'course_work_submissions' },
          { main: 'oral_assignments', sub: 'oral_assignment_submissions' }
        ];

        for (const t of tables) {
          // Find ALL student's submissions in old class
          const [oldSubs] = await dbp.query(
            `SELECT s.*, m.title, m.type FROM ${t.sub} s JOIN ${t.main} m ON s.assignment_id = m.id WHERE s.student_id = ? AND m.class_id = ?`,
            [id, oldClassId]
          );

          console.log(`[Migration] Found ${oldSubs.length} ${t.sub} in old class ${oldClassId}`);

          for (const sub of oldSubs) {
            // Try to find matching assignment in new class by title
            const [newAssign] = await dbp.query(
              `SELECT id FROM ${t.main} WHERE class_id = ? AND title = ? LIMIT 1`,
              [newClassId, sub.title]
            );

            if (newAssign[0]) {
              // Check if submission already exists in new class
              const [existingNewSub] = await dbp.query(
                `SELECT id FROM ${t.sub} WHERE student_id = ? AND assignment_id = ?`,
                [id, newAssign[0].id]
              );

              if (!existingNewSub[0]) {
                // Migrate the submission to the new assignment
                await dbp.query(
                  `UPDATE ${t.sub} SET assignment_id = ? WHERE id = ?`,
                  [newAssign[0].id, sub.id]
                );
                console.log(`[Migration] ✅ Migrated ${t.sub} ID ${sub.id} to new assignment ${newAssign[0].id}`);
              } else {
                console.log(`[Migration] ⚠️ Submission already exists in new class for assignment "${sub.title}", skipping`);
              }
            } else {
              console.log(`[Migration] ⚠️ No matching assignment found in new class for "${sub.title}"`);
            }
          }
        }

        // Also migrate attendance records if same subprogram
        const [attendanceResult] = await dbp.query(
          "UPDATE attendance SET class_id = ? WHERE student_id = ? AND class_id = ?",
          [newClassId, id, oldClassId]
        );
        console.log(`[Migration] ✅ Migrated ${attendanceResult.affectedRows} attendance records`);
      } else if (oldClassId) {
        console.log(`[Promotion] Level change detected (${oldSubprogramId} → ${subprogramId}). Skipping assignment migration to preserve history.`);
      }
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      student: updated
    });
  } catch (err) {
    console.error("❌ Update student error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Student.getStudentById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    await Student.deleteStudentById(id);
    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (err) {
    console.error("❌ Delete student error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// APPROVE STUDENT
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Approve request received for student ID:", id);

    const existing = await Student.getStudentById(id);
    console.log("📝 Existing student:", existing ? "Found" : "Not found");

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    console.log("📝 Current approval_status:", existing.approval_status);
    const updateResult = await Student.updateApprovalStatus(id, 'approved');
    console.log("📝 Update result:", updateResult);

    const updated = await Student.getStudentById(id);
    console.log("📝 Updated student approval_status:", updated?.approval_status);

    res.json({
      success: true,
      message: "Student approved successfully",
      student: updated
    });
  } catch (err) {
    console.error("❌ Approve student error:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// REJECT STUDENT
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Reject request received for student ID:", id);

    const existing = await Student.getStudentById(id);
    console.log("📝 Existing student:", existing ? "Found" : "Not found");

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    console.log("📝 Current approval_status:", existing.approval_status);
    // Use rejectStudentById to set status to 'rejected' and class_id to NULL
    const updateResult = await Student.rejectStudentById(id);
    console.log("📝 Update result:", updateResult);

    const updated = await Student.getStudentById(id);
    console.log("📝 Updated student approval_status:", updated?.approval_status);

    res.json({
      success: true,
      message: "Student rejected successfully",
      student: updated
    });
  } catch (err) {
    console.error("❌ Reject student error:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// GET STUDENT PROGRESS
export const getStudentProgress = async (req, res) => {
  try {
    const { userId, role } = req.user;

    // If student, return only their own progress
    if (role === 'student' || role === 'proficiency_student') {
      const progress = await Student.getStudentProgressById(userId);
      return res.json({
        success: true,
        students: progress ? [progress] : []
      });
    }

    // Teachers get all students in their classes
    if (role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Teachers or students only."
      });
    }

    const students = await Student.getStudentProgressByTeacher(userId);

    res.json({
      success: true,
      students
    });
  } catch (err) {
    console.error("❌ Get student progress error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// GET SEX DISTRIBUTION
export const getSexDistribution = async (req, res) => {
  try {
    const { program_id, class_id } = req.query;
    const students = await Student.getSexDistribution(program_id, class_id);

    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    console.error("❌ Get gender distribution error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// GET TOP STUDENTS (Star Students)
export const getTopStudents = async (req, res) => {
  try {
    const { limit = 10, program_id, class_id } = req.query;
    // Fix limit to always be numeric
    const cleanLimit = parseInt(limit) || 10;

    console.log(`📊 Fetching top students (Limit: ${cleanLimit}, Program: ${program_id || 'All'})`);

    const students = await Student.getTopStudents(cleanLimit, program_id, class_id);

    res.json({
      success: true,
      students
    });
  } catch (err) {
    console.error("❌ Get top students error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// GET STUDENT LOCATIONS
export const getStudentLocations = async (req, res) => {
  try {
    const { program_id, class_id } = req.query;
    const locations = await Student.getStudentLocations(program_id, class_id);

    res.json({
      success: true,
      locations
    });
  } catch (err) {
    console.error("❌ Get student locations error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// GET MY CLASSES (For Student Grades Dropdown)
export const getMyClasses = async (req, res) => {
  try {
    const studentId = req.user.userId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: "Student ID missing from session" });
    }

    console.log(`[GetMyClasses] Performing deep academic audit for: "${studentId}"`);

    // 1. Fetch Student Profile Basics (For fallback names if class links are broken)
    const [stdProfile] = await dbp.query(
      `SELECT chosen_program as program_name, chosen_subprogram as subprogram_name, class_id FROM students WHERE student_id = ? 
       UNION 
       SELECT IFNULL(chosen_program, exam_type) as program_name, IFNULL(exam_type, 'IELTS') as subprogram_name, class_id FROM IELTSTOEFL WHERE student_id = ?`,
      [studentId, studentId]
    );

    const profile = stdProfile[0] || {};

    const classIds = new Set();
    const activeClassId = new Set();
    if (profile.class_id) {
      classIds.add(profile.class_id);
      activeClassId.add(profile.class_id);
    }

    // 2. Discover historical Class IDs
    const [hist] = await dbp.query("SELECT class_id FROM student_class_history WHERE student_id = ?", [studentId]);
    hist.forEach(r => classIds.add(r.class_id));

    // 3. Discover Submission Class IDs
    const subTables = ['exam_submissions', 'writing_task_submissions', 'course_work_submissions', 'oral_assignment_submissions'];
    const assTables = ['exams', 'writing_tasks', 'course_work', 'oral_assignments'];
    for (let i = 0; i < subTables.length; i++) {
      try {
        const [rows] = await dbp.query(
          `SELECT DISTINCT a.class_id FROM ${subTables[i]} sub JOIN ${assTables[i]} a ON sub.assignment_id = a.id WHERE sub.student_id = ?`,
          [studentId]
        );
        rows.forEach(r => { if (r.class_id) classIds.add(r.class_id); });
      } catch (e) { /* skip */ }
    }

    if (classIds.size === 0) {
      return res.json({ success: true, classes: [] });
    }

    // 4. Resolve metadata
    const idList = Array.from(classIds);
    const [details] = await dbp.query(
      `SELECT c.id, c.class_name, c.subprogram_id,
              COALESCE(s.subprogram_name, ?) as subprogram_name, 
              COALESCE(p.title, ?) as program_name
       FROM classes c
       LEFT JOIN subprograms s ON c.subprogram_id = s.id
       LEFT JOIN programs p ON s.program_id = p.id
       WHERE c.id IN (?)`,
      [profile.subprogram_name || "General", profile.program_name || "General Program", idList]
    );

    const result = details.map(r => ({
      ...r,
      is_active: activeClassId.has(r.id) ? 1 : 0
    })).sort((a, b) => b.is_active - a.is_active);

    console.log(`[GetMyClasses] FINISH. Found ${result.length} enrollments.`);

    res.json({
      success: true,
      classes: result
    });
  } catch (err) {
    console.error("❌ CRITICAL ERROR in getMyClasses:", err);
    res.status(500).json({ success: false, error: "Academic data resolution failed" });
  }
};

// GET STUDENTS BY CLASS (For Teacher Review)
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await Student.getStudentsByClassId(classId);
    res.json({
      success: true,
      students
    });
  } catch (err) {
    console.error("❌ Get students by class error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};
// GET DETAILED STUDENT REPORT
export const getDetailedStudentReport = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { studentId: targetStudentId } = req.query;

    let targetId = userId;

    // Permissions check: Only teachers and admins can view other students' reports
    if (targetStudentId && targetStudentId !== String(userId)) {
      if (role !== 'teacher' && role !== 'admin') {
        return res.status(403).json({ success: false, error: "Access denied. Only teachers and admins can view other students' reports." });
      }
      targetId = targetStudentId;
    }

    console.log(`[DetailedReport] Generating comprehensive report for targetId: ${targetId} (Requested by: ${userId}, Role: ${role})`);

    // 1. Basic Student & Class Info
    const [studentInfo] = await dbp.query(
      `SELECT s.student_id, s.full_name, s.email, s.chosen_program, s.chosen_subprogram, 
              s.class_id, c.class_name, p.title as program_name, sub.subprogram_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN programs p ON s.chosen_program = p.id
       LEFT JOIN subprograms sub ON s.chosen_subprogram = sub.id
       WHERE s.student_id = ?`,
      [targetId]
    );

    if (!studentInfo[0]) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const student = studentInfo[0];

    // 2. Attendance Stats
    const [attendance] = await dbp.query(
      `SELECT 
        COUNT(id) as sessions,
        SUM((CASE WHEN hour1 = 1 THEN 1 ELSE 0 END) + (CASE WHEN hour2 = 1 THEN 1 ELSE 0 END)) as attended_hours,
        COUNT(id) * 2 as possible_hours
       FROM attendance
       WHERE student_id = ?`,
      [targetId]
    );

    const attendanceStats = {
      total_sessions: attendance[0].sessions || 0,
      attendance_rate: attendance[0].possible_hours > 0
        ? Math.round((attendance[0].attended_hours / attendance[0].possible_hours) * 100)
        : 0
    };

    // 3. Assignment Performance Breakdown
    const tables = [
      { key: 'exams', main: 'exams', sub: 'exam_submissions', label: 'Exams' },
      { key: 'writing', main: 'writing_tasks', sub: 'writing_task_submissions', label: 'Writing Tasks' },
      { key: 'oral', main: 'oral_assignments', sub: 'oral_assignment_submissions', label: 'Oral Assignments' },
      { key: 'coursework', main: 'course_work', sub: 'course_work_submissions', label: 'Course Work' }
    ];

    let performance = [];
    let allSubmissions = [];

    for (const t of tables) {
      const [submissions] = await dbp.query(
        `SELECT s.id, s.score, s.status, s.feedback, s.created_at, a.title, a.total_points as max_score
         FROM ${t.sub} s
         JOIN ${t.main} a ON s.assignment_id = a.id
         WHERE s.student_id = ? AND s.status = 'graded'`,
        [targetId]
      );

      const count = submissions.length;
      const avg = count > 0
        ? Math.round(submissions.reduce((sum, s) => sum + Number(s.score || 0), 0) / count)
        : 0;

      performance.push({
        category: t.label,
        count: count,
        average: avg,
        key: t.key
      });

      allSubmissions.push(...submissions.map(s => ({ ...s, type: t.label })));
    }

    // Sort submissions by date descending
    allSubmissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate overall GPA (Average of averages if categories exist)
    const activeCategories = performance.filter(p => p.count > 0);
    const overallGPA = activeCategories.length > 0
      ? Math.round(activeCategories.reduce((sum, p) => sum + p.average, 0) / activeCategories.length)
      : 0;

    // 4. Recent Teacher Feedback (Reviews of Student)
    const [feedback] = await dbp.query(
      `SELECT sr.comment as feedback, sr.created_at, t.full_name as teacher_name
       FROM student_reviews sr
       JOIN teachers t ON sr.teacher_id = t.id
       WHERE sr.student_id = ?
       ORDER BY sr.created_at DESC LIMIT 3`,
      [targetId]
    );

    res.json({
      success: true,
      data: {
        student,
        summary: {
          attendance_rate: attendanceStats.attendance_rate,
          overall_gpa: overallGPA,
          total_assignments: performance.reduce((sum, p) => sum + p.count, 0)
        },
        performance,
        submissions: allSubmissions,
        recent_feedback: feedback
      }
    });

  } catch (err) {
    console.error("❌ Detailed report error:", err);
    res.status(500).json({ success: false, error: "Failed to generate report" });
  }
};

import * as Student from "../models/studentModel.js";
import { createPayment } from '../models/paymentModel.js';
import bcrypt from "bcryptjs";
import { validatePassword, passwordPolicyMessage } from "../utils/passwordValidator.js";

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
      scholarship_percentage
    } = req.body;

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
      if (funding_status === 'Sponsorship' && sponsorship_package !== 'None') {
        // We'll approximate months as 30 days for simplicity
        // In a real app we might fetch the package details to get the exact months
        // For now let's default to 1 month and handle sponsorship packages later if needed
        initialPaidUntil = new Date(now.setDate(now.getDate() + 30));
      } else {
        initialPaidUntil = new Date(now.setDate(now.getDate() + 30));
      }
    }

    const student = await Student.createStudent({
      full_name,
      email,
      phone,
      age,
      sex,
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
      funding_status,
      sponsorship_package,
      funding_amount,
      funding_month,
      scholarship_percentage,
      paid_until: initialPaidUntil
    });

    console.log('✅ Student created with ID:', student?.student_id);

    // If payment info provided, save payment and set approval_status to 'pending'
    let updatedStudent = student;
    if (req.body.payment) {
      console.log('📝 Payment info found in request:', req.body.payment);
      try {
        const paymentData = {
          student_id: student.student_id,
          method: req.body.payment.method || 'waafi',
          provider_transaction_id: req.body.payment.transactionId || null,
          amount: req.body.payment.amount || 0,
          currency: req.body.payment.currency || 'USD',
          status: 'paid',
          raw_response: { note: 'Registration Fee', ...(req.body.payment.raw || req.body.payment.rawResponse || {}) },
          payer_phone: req.body.payment.payerPhone || null,
          program_id: req.body.payment.program_id || null
        };
        console.log('📝 Attempting to create payment record with data:', paymentData);

        const payment = await createPayment(paymentData);
        console.log('✅ Payment record created successfully:', payment.id);

        // Update paid_until and mark student awaiting admin approval
        const currentPaidUntil = student.paid_until ? new Date(student.paid_until) : new Date();
        const baseDate = currentPaidUntil > new Date() ? currentPaidUntil : new Date();
        const newPaidUntil = new Date(baseDate.setDate(baseDate.getDate() + 30));

        await Student.updateStudentById(student.student_id, {
          approval_status: 'pending',
          paid_until: newPaidUntil
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

    await Student.updateStudentById(id, updateData);
    const updated = await Student.getStudentById(id);

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
    // Get teacher ID from authenticated user
    const teacherId = req.user.userId;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Teachers only."
      });
    }

    const students = await Student.getStudentProgressByTeacher(teacherId);

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
    const students = await Student.getTopStudents(limit, program_id, class_id);

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
    const { program_id } = req.query;
    const locations = await Student.getStudentLocations(program_id);

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

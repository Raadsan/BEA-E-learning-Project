import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { validatePassword, passwordPolicyMessage } from '../utils/passwordValidator.js';

// Generate JWT Token
const generateToken = (userId, role, email) => {
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
    { expiresIn: "7d" }
  );
};

// LOGIN - Automatically detects role by checking all tables
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    let user = null;
    let userData = null;
    let detectedRole = null;

    // 1. Check admin
    user = await prisma.admins.findUnique({ where: { email } });
    if (user) {
      detectedRole = 'admin';
      userData = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role || 'admin',
        status: user.status
      };
    } else {
      // 2. Check teacher
      user = await prisma.teachers.findUnique({ where: { email } });
      if (user) {
        detectedRole = 'teacher';
        userData = {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: 'teacher',
          specialization: user.specialization,
          status: user.status
        };
      } else {
        // 3. Check student
        user = await prisma.students.findUnique({ where: { email } });
        if (user) {
          detectedRole = 'student';
          userData = {
            id: user.student_id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            phone: user.phone,
            residency_country: user.residency_country,
            residency_city: user.residency_city,
            chosen_program: user.chosen_program,
            chosen_subprogram: user.chosen_subprogram,
            sponsor_name: user.sponsor_name,
            approval_status: user.approval_status,
            class_id: user.class_id,
            paid_until: user.paid_until,
            expiry_date: user.expiry_date
          };
        } else {
          // 4. Check IELTS
          user = await prisma.IELTSTOEFL.findFirst({ where: { email } });
          if (user) {
            detectedRole = 'student';
            userData = {
              id: user.student_id,
              full_name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              role: 'student',
              phone: user.phone,
              residency_country: user.residency_country,
              residency_city: user.residency_city,
              chosen_program: user.chosen_program,
              exam_type: user.exam_type,
              verification_method: user.verification_method,
              approval_status: user.status || 'Pending',
              is_ielts: true,
              expiry_date: user.expiry_date,
              created_at: user.registration_date
            };
          } else {
            // 5. Check Proficiency Test
            user = await prisma.ProficiencyTestStudents.findUnique({ where: { email } });
            if (user) {
              detectedRole = 'proficiency_student';
              userData = {
                id: user.student_id,
                full_name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: 'proficiency_student',
                phone: user.phone,
                residency_country: user.residency_country,
                residency_city: user.residency_city,
                program: 'Proficiency Test',
                approval_status: user.status,
                status: user.status,
                expiry_date: user.expiry_date,
                is_extended: user.is_extended
              };
            }
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Check Status
    if (user.status === 'inactive' || user.approval_status === 'inactive') {
      return res.status(403).json({ success: false, error: "Your account is inactive. Please contact support." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(userData.id, userData.role, userData.email);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
};

// VERIFY TOKEN - Middleware helper
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

// CHECK AUTH STATUS - Get current user from token
export const getCurrentUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let user = null;

    switch (role) {
      case 'admin':
        user = await prisma.admins.findUnique({ where: { id: parseInt(userId) } });
        if (user) {
          user = {
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            profile_picture: user.profile_picture,
            role: user.role || 'admin',
            status: user.status,
            created_at: user.created_at
          };
        }
        break;

      case 'student':
        user = await prisma.students.findUnique({ where: { student_id: userId } });
        if (user) {
          const programDetails = await prisma.programs.findFirst({ where: { title: user.chosen_program } });
          const certificatesCount = await prisma.issued_certificates.count({ where: { student_id: user.student_id } });
          const completedCoursesCount = user.completed_subprograms ? user.completed_subprograms.split(',').filter(s => s.trim()).length : 0;

          user = {
            id: user.student_id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            phone: user.phone,
            residency_country: user.residency_country,
            residency_city: user.residency_city,
            chosen_program: user.chosen_program,
            chosen_subprogram: user.chosen_subprogram,
            completed_subprograms: user.completed_subprograms,
            sponsor_name: user.sponsor_name,
            approval_status: user.approval_status,
            class_id: user.class_id,
            profile_picture: user.profile_picture,
            paid_until: user.paid_until,
            expiry_date: user.expiry_date,
            created_at: user.created_at,
            program_test_required: programDetails?.test_required || 'none',
            certificates_count: certificatesCount,
            completed_courses_count: completedCoursesCount
          };
        } else {
          user = await prisma.IELTSTOEFL.findUnique({ where: { student_id: userId } });
          if (user) {
            user = {
              id: user.student_id,
              full_name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              role: 'student',
              phone: user.phone,
              residency_country: user.residency_country,
              residency_city: user.residency_city,
              chosen_program: user.chosen_program,
              exam_type: user.exam_type,
              verification_method: user.verification_method,
              approval_status: user.status || 'Pending',
              is_ielts: true,
              expiry_date: user.expiry_date,
              created_at: user.registration_date
            };
          }
        }
        break;

      case 'proficiency_student':
        user = await prisma.ProficiencyTestStudents.findUnique({ where: { student_id: userId } });
        if (user) {
          user = {
            id: user.student_id,
            full_name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: 'proficiency_student',
            phone: user.phone,
            residency_country: user.residency_country,
            residency_city: user.residency_city,
            program: 'Proficiency Test',
            status: user.status,
            expiry_date: user.expiry_date,
            is_extended: user.is_extended
          };
        }
        break;

      case 'teacher':
        user = await prisma.teachers.findUnique({ where: { id: parseInt(userId) } });
        if (user) {
          user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'teacher',
            phone: user.phone,
            country: user.country,
            city: user.city,
            specialization: user.specialization,
            bio: user.bio,
            profile_picture: user.profile_picture,
            status: user.status
          };
        }
        break;
    }

    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Get current user error:", err);
    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
};

// ADMIN AUTHORIZATION MIDDLEWARE
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: "Authorization failed" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    // Look for user in all relevant tables
    const admin = await prisma.admins.findUnique({ where: { email } });
    const teacher = await prisma.teachers.findUnique({ where: { email } });
    const student = await prisma.students.findUnique({ where: { email } });
    const ielts = await prisma.IELTSTOEFL.findFirst({ where: { email } });
    const proficiency = await prisma.ProficiencyTestStudents.findUnique({ where: { email } });

    const user = admin || teacher || student || ielts || proficiency;
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    const updateData = { reset_password_token: resetToken, reset_password_expires: resetExpires };

    if (admin) await prisma.admins.update({ where: { id: admin.id }, data: updateData });
    else if (teacher) await prisma.teachers.update({ where: { id: teacher.id }, data: updateData });
    else if (student) await prisma.students.update({ where: { student_id: student.student_id }, data: updateData });
    else if (ielts) await prisma.IELTSTOEFL.update({ where: { student_id: ielts.student_id }, data: updateData });
    else if (proficiency) await prisma.ProficiencyTestStudents.update({ where: { student_id: proficiency.student_id }, data: updateData });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://178.18.241.5:2004'}/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - BEA',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #010080; text-align: center;">Password Reset Request</h2>
            <p>You requested a password reset for your BEA account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #010080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>If you didn't request this, ignore this email.</p>
          </div>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ success: false, error: "New password is required" });
    if (!validatePassword(password)) return res.status(400).json({ success: false, error: passwordPolicyMessage });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updateData = { password: hashedPassword, reset_password_token: null, reset_password_expires: null };

    // Find and update user across tables
    const admin = await prisma.admins.findFirst({ where: { reset_password_token: token, reset_password_expires: { gt: new Date() } } });
    if (admin) { await prisma.admins.update({ where: { id: admin.id }, data: updateData }); return res.json({ success: true, message: "Password updated" }); }

    const teacher = await prisma.teachers.findFirst({ where: { reset_password_token: token, reset_password_expires: { gt: new Date() } } });
    if (teacher) { await prisma.teachers.update({ where: { id: teacher.id }, data: updateData }); return res.json({ success: true, message: "Password updated" }); }

    const student = await prisma.students.findFirst({ where: { reset_password_token: token, reset_password_expires: { gt: new Date() } } });
    if (student) { await prisma.students.update({ where: { student_id: student.student_id }, data: updateData }); return res.json({ success: true, message: "Password updated" }); }

    const ielts = await prisma.IELTSTOEFL.findFirst({ where: { reset_password_token: token, reset_password_expires: { gt: new Date() } } });
    if (ielts) { await prisma.IELTSTOEFL.update({ where: { student_id: ielts.student_id }, data: updateData }); return res.json({ success: true, message: "Password updated" }); }

    const proficiency = await prisma.ProficiencyTestStudents.findFirst({ where: { reset_password_token: token, reset_password_expires: { gt: new Date() } } });
    if (proficiency) { await prisma.ProficiencyTestStudents.update({ where: { student_id: proficiency.student_id }, data: updateData }); return res.json({ success: true, message: "Password updated" }); }

    return res.status(400).json({ success: false, error: "Invalid or expired token" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
};

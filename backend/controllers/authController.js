// controllers/authController.js
import * as Student from "../models/studentModel.js";
import * as Teacher from "../models/teacherModel.js";
import * as Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    let user = null;
    let userData = null;
    let detectedRole = null;

    // Check all tables to find the user (priority: admin > teacher > student)
    // Check admin first
    try {
      user = await Admin.getAdminByEmail(email);
      if (user) {
        detectedRole = 'admin';
        userData = {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role || 'admin'
        };
      }
    } catch (adminError) {
      console.error("❌ Error fetching admin:", adminError);
      // Continue to check other roles
    }

    if (!user) {
      // Check teacher
      user = await Teacher.getTeacherByEmail(email);
      if (user) {
        detectedRole = 'teacher';
        userData = {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: 'teacher',
          specialization: user.specialization
        };
      } else {
        // Check student
        user = await Student.getStudentByEmail(email);
        if (user) {
          detectedRole = 'student';
          userData = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            chosen_program: user.chosen_program,
            chosen_subprogram: user.chosen_subprogram,
            approval_status: user.approval_status || 'pending'
          };
        }
      }
    }

    // Check if user exists
    if (!user) {
      console.log(`❌ Login failed: User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Verify password
    if (!user.password) {
      console.log(`❌ Login failed: No password hash found for user: ${email}`);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = generateToken(userData.id, userData.role, userData.email);

    // Return success response with user data and token
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// VERIFY TOKEN - Middleware helper
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
};

// CHECK AUTH STATUS - Get current user from token
export const getCurrentUser = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        error: "Invalid token data"
      });
    }

    let user = null;

    // Get user data based on role
    switch (role) {
      case 'admin':
        try {
          user = await Admin.getAdminById(userId);
          if (user) {
            user = {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              role: user.role || 'admin'
            };
          } else {
            console.error(`Admin with ID ${userId} not found`);
          }
        } catch (adminError) {
          console.error("Error fetching admin:", adminError);
          console.error("Admin Error Details:", {
            message: adminError.message,
            stack: adminError.stack,
            userId,
            role
          });
          // Don't throw, let it continue to return 404
        }
        break;

      case 'student':
        user = await Student.getStudentById(userId);
        if (user) {
          user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            chosen_program: user.chosen_program,
            chosen_subprogram: user.chosen_subprogram,
            approval_status: user.approval_status || 'pending'
          };
        }
        break;

      case 'teacher':
        user = await Teacher.getTeacherById(userId);
        if (user) {
          user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'teacher',
            specialization: user.specialization
          };
        }
        break;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("❌ Get current user error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    let user = null;
    let role = null;

    // Check all tables
    user = await Admin.getAdminByEmail(email);
    if (user) role = 'admin';

    if (!user) {
      user = await Teacher.getTeacherByEmail(email);
      if (user) role = 'teacher';
    }

    if (!user) {
      user = await Student.getStudentByEmail(email);
      if (user) role = 'student';
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Generate token
    const crypto = await import("crypto");
    const resetToken = crypto.default.randomBytes(20).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token to DB
    if (role === 'admin') {
      await Admin.updateAdminById(user.id, {
        reset_password_token: resetToken,
        reset_password_expires: resetExpires
      });
    } else if (role === 'teacher') {
      await Teacher.updateTeacherById(user.id, {
        reset_password_token: resetToken,
        reset_password_expires: resetExpires
      });
    } else if (role === 'student') {
      await Student.updateStudentById(user.id, {
        reset_password_token: resetToken,
        reset_password_expires: resetExpires
      });
    }

    // Send email
    const nodemailer = await import("nodemailer");

    // Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email credentials missing in .env file");
      return res.status(500).json({
        success: false,
        error: "Server configuration error: Email credentials missing"
      });
    }

    // Clean email password (remove spaces that might be in .env file)
    const emailPass = String(process.env.EMAIL_PASS).trim().replace(/\s+/g, '');
    const emailUser = String(process.env.EMAIL_USER).trim();

    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"BEA E-Learning" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #010080;">Password Reset Request</h2>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #010080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent" });

  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required" });
    }

    let user = null;
    let role = null;

    // Find user by token
    user = await Admin.getAdminByResetToken(token);
    if (user) role = 'admin';

    if (!user) {
      user = await Teacher.getTeacherByResetToken(token);
      if (user) role = 'teacher';
    }

    if (!user) {
      user = await Student.getStudentByResetToken(token);
      if (user) role = 'student';
    }

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    // Update password and clear token
    // Note: Models handle hashing if password is provided
    if (role === 'admin') {
      await Admin.updateAdminById(user.id, {
        password,
        reset_password_token: null,
        reset_password_expires: null
      });
    } else if (role === 'teacher') {
      await Teacher.updateTeacherById(user.id, {
        password,
        reset_password_token: null,
        reset_password_expires: null
      });
    } else if (role === 'student') {
      await Student.updateStudentById(user.id, {
        password,
        reset_password_token: null,
        reset_password_expires: null
      });
    }

    res.json({ success: true, message: "Password updated successfully" });

  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


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
    user = await Admin.getAdminByEmail(email);
    if (user) {
      detectedRole = 'admin';
      userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.role || 'admin'
      };
    } else {
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

    // Verify password (plain text comparison - no encryption/decryption)
    const isPasswordValid = password === user.password;
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
        user = await Admin.getAdminById(userId);
        if (user) {
          user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            email: user.email,
            role: user.role || 'admin'
          };
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


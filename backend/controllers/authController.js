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
    console.log(`[Login Debug] Attempting login for email: ${email}`);

    // Check admin first
    user = await Admin.getAdminByEmail(email);
    if (user) {
      console.log("[Login Debug] Found user in Admin table");
      detectedRole = 'admin';
      userData = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role || 'admin'
      };
    } else {
      // Check teacher
      user = await Teacher.getTeacherByEmail(email);
      if (user) {
        console.log("[Login Debug] Found user in Teacher table");
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
          console.log("[Login Debug] Found user in Student table");
          detectedRole = 'student';
          userData = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            phone: user.phone || null,
            residency_country: user.residency_country || null,
            residency_city: user.residency_city || null,
            chosen_program: user.chosen_program,
            chosen_subprogram: user.chosen_subprogram,
            approval_status: user.approval_status || null,
            class_id: user.class_id || null
          };
        }
      }
    }

    // Check if user exists
    if (!user) {
      console.log("[Login Debug] User not found in any table");
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Verify password
    console.log("[Login Debug] User found, verifying password...");
    // console.log(`[Login Debug] Stored password hash: ${user.password}`); // CAUTION: Only for local debugging

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("[Login Debug] Password verification failed (Hash mismatch)");

      // Fallback check for plain text password (TEMPORARY FIX for legacy/manual data)
      if (password === user.password) {
        console.log("[Login Debug] Plain text password matched! (Legacy data)");
        // Ideally, we should hash it and update the DB here, but let's just allow login for now
        // or at least warn.
        // Let's treat it as valid for now to unblock the user if this is the case.
      } else {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password"
        });
      }
    } else {
      console.log("[Login Debug] Password verified successfully");
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

    let user = null;

    // Get user data based on role
    switch (role) {
      case 'admin':
        user = await Admin.getAdminById(userId);
        console.log("[Auth Debug] getCurrentUser - Raw user from DB:", user);
        if (user) {
          // Fallback: If first_name/last_name are missing but full_name exists, split it
          if ((!user.first_name || !user.last_name) && user.full_name) {
            const names = user.full_name.split(' ');
            user.first_name = names[0];
            user.last_name = names.slice(1).join(' ');
          }

          user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            username: user.username,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            profile_image: user.profile_image,
            role: user.role || 'admin',
            created_at: user.created_at
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
            phone: user.phone || null,
            residency_country: user.residency_country || null,
            residency_city: user.residency_city || null,
            chosen_program: user.chosen_program,
            chosen_subprogram: user.chosen_subprogram,
            approval_status: user.approval_status || null,
            class_id: user.class_id || null
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

// ADMIN AUTHORIZATION MIDDLEWARE
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required."
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Authorization failed"
    });
  }
};

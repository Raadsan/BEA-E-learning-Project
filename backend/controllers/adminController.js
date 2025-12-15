// controllers/adminController.js
import * as Admin from "../models/adminModel.js";

// CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role = 'admin', status = 'active' } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        success: false,
        error: "First name, last name, and email are required" 
      });
    }

    // Validate password for new admins
    if (!password || password.trim() === "") {
      return res.status(400).json({ 
        success: false,
        error: "Password is required" 
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

    // Check if email already exists
    const existingAdmin = await Admin.getAdminByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        error: "Email already exists" 
      });
    }

    const newAdmin = await Admin.createAdmin({
      first_name,
      last_name,
      email,
      phone,
      password,
      role,
      status
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: newAdmin
    });
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};

// GET ALL ADMINS
export const getAdmins = async (req, res) => {
  try {
    console.log("📥 GET /api/admins - Fetching all admins...");
    const admins = await Admin.getAllAdmins();
    console.log(`✅ Found ${admins.length} admins`);
    res.json({
      success: true,
      admins: admins || []
    });
  } catch (err) {
    console.error("❌ Error fetching admins:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};

// GET SINGLE ADMIN
export const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.getAdminById(id);

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        error: "Admin not found" 
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (err) {
    console.error("❌ Error fetching admin:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};

// UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, password, role, status } = req.body;

    // Check if admin exists
    const existingAdmin = await Admin.getAdminById(id);
    if (!existingAdmin) {
      return res.status(404).json({ 
        success: false,
        error: "Admin not found" 
      });
    }

    // If email is being updated, check if new email already exists
    if (email && email !== existingAdmin.email) {
      const emailExists = await Admin.getAdminByEmail(email);
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          error: "Email already exists" 
        });
      }
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid email format" 
        });
      }
    }

    const affectedRows = await Admin.updateAdminById(id, {
      first_name,
      last_name,
      email,
      phone,
      password,
      role,
      status
    });

    if (affectedRows === 0) {
      return res.status(400).json({ 
        success: false,
        error: "No changes made" 
      });
    }

    const updatedAdmin = await Admin.getAdminById(id);
    res.json({
      success: true,
      message: "Admin updated successfully",
      admin: updatedAdmin
    });
  } catch (err) {
    console.error("❌ Error updating admin:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};

// DELETE ADMIN
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await Admin.getAdminById(id);
    if (!existingAdmin) {
      return res.status(404).json({ 
        success: false,
        error: "Admin not found" 
      });
    }

    const affectedRows = await Admin.deleteAdminById(id);

    if (affectedRows === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Failed to delete admin" 
      });
    }

    res.json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting admin:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};


// controllers/userController.js
import * as User from "../models/userModel.js";

// GET ALL USERS (admins, teachers, students)
export const getUsers = async (req, res) => {
  try {
    console.log("📥 GET /api/users - Fetching all users...");
    const users = await User.getAllUsers();
    console.log(`✅ Found ${users.length} users`);
    res.json({
      success: true,
      users: users || []
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};



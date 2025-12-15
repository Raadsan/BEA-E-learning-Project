// controllers/studentController.js
import * as Student from "../models/studentModel.js";

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
      class_id
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

    // Check if email already exists
    const existingStudent = await Student.getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }

    const student = await Student.createStudent({
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
      class_id
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student
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

    await Student.updateStudentById(id, req.body);
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


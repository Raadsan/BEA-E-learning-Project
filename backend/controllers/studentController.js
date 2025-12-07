// controllers/studentController.js
import * as Student from "../models/studentModel.js";
import * as Program from "../models/programModel.js";

// REGISTER STUDENT
export const registerStudent = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      age,
      gender,
      country,
      city,
      program_id,
      sub_program_id,
      sub_program_name, // Can use name instead of id
      password,
      terms_accepted,
      // Parent info (required if age < 18)
      parent_first_name,
      parent_last_name,
      parent_email,
      parent_phone,
      relationship
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !age || !gender || 
        !country || !city || !program_id || !password || terms_accepted === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "All required fields must be provided" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Check if email already exists
    const existingStudent = await Student.getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Validate program exists
    const program = await Program.getProgramById(program_id);
    if (!program) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid program selected" 
      });
    }

    // Validate sub_program if provided (must exist in program's sub_programs JSON array)
    if (sub_program_id || sub_program_name) {
      const subPrograms = await Student.getSubProgramsByProgramId(program_id);
      
      // sub_program_id can be index or name
      let subProgram = null;
      if (sub_program_id) {
        // Try to find by index
        const index = parseInt(sub_program_id);
        if (!isNaN(index) && index >= 0 && index < subPrograms.length) {
          subProgram = subPrograms[index];
        }
      }
      
      // If not found by index, try by name
      if (!subProgram && sub_program_name) {
        subProgram = subPrograms.find(sp => sp.name === sub_program_name);
      }
      
      if (!subProgram) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid sub-program selected. The sub-program must belong to the selected main program." 
        });
      }
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid age" 
      });
    }

    // If student is under 18, require parent information
    if (ageNum < 18) {
      if (!parent_first_name || !parent_last_name || !parent_email || 
          !parent_phone || !relationship) {
        return res.status(400).json({ 
          success: false,
          message: "Parent/Guardian information is required for students under 18" 
        });
      }

      // Validate parent email format
      if (!emailRegex.test(parent_email)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid parent email format" 
        });
      }
    }

    // Create student
    const student = await Student.createStudent({
      first_name,
      last_name,
      email,
      phone,
      age: ageNum,
      gender,
      country,
      city,
      program_id: parseInt(program_id),
      sub_program_id: sub_program_id ? parseInt(sub_program_id) : null,
      password,
      terms_accepted: terms_accepted === true || terms_accepted === 'true'
    });

    // Create parent record if student is under 18
    let parent = null;
    if (ageNum < 18) {
      parent = await Student.createParent({
        student_id: student.id,
        parent_first_name,
        parent_last_name,
        parent_email,
        parent_phone,
        relationship
      });
    }

    res.status(201).json({ 
      success: true,
      message: "Student registered successfully",
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        age: student.age,
        program_id: student.program_id,
        sub_program_id: student.sub_program_id,
        is_minor: student.is_minor
      },
      parent: parent ? {
        id: parent.id,
        parent_first_name: parent.parent_first_name,
        parent_last_name: parent.parent_last_name,
        relationship: parent.relationship
      } : null
    });

  } catch (err) {
    console.error("❌ Student Registration Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to register student",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
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
    console.error(err);
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
    const updated = await Student.updateStudentById(id, req.body);

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        error: "Student not found or no changes made" 
      });
    }

    res.json({ 
      success: true,
      message: "Student updated successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};

// DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.deleteStudentById(id);

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: "Student not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Student deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};

// GET SUB-PROGRAMS BY PROGRAM ID
export const getSubPrograms = async (req, res) => {
  try {
    const { program_id } = req.params;
    const subPrograms = await Student.getSubProgramsByProgramId(program_id);
    res.json({ 
      success: true,
      sub_programs: subPrograms 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};

// GET ALL SUB-PROGRAMS (returns all programs with their sub-programs)
export const getAllSubPrograms = async (req, res) => {
  try {
    const programs = await Student.getAllProgramsWithSubPrograms();
    res.json({ 
      success: true,
      programs 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};


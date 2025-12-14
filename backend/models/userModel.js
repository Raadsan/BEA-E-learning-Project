// models/userModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// GET all users (combining admins, teachers, and students)
export const getAllUsers = async () => {
  try {
    // Get all admins (password is now plain text)
    const [admins] = await dbp.query(
      `SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        password,
        role,
        status,
        'admin' as user_type,
        created_at,
        updated_at
      FROM admins
      ORDER BY created_at DESC`
    );

    // Get all teachers
    const [teachers] = await dbp.query(
      `SELECT 
        id,
        full_name,
        email,
        password,
        'teacher' as role,
        'active' as status,
        'teacher' as user_type,
        created_at,
        updated_at
      FROM teachers
      ORDER BY created_at DESC`
    );

    // Get all students
    const [students] = await dbp.query(
      `SELECT 
        id,
        full_name,
        email,
        password,
        'student' as role,
        'active' as status,
        'student' as user_type,
        created_at,
        updated_at
      FROM students
      ORDER BY created_at DESC`
    );

    // Combine all users (passwords are already plain text, no decryption needed)
    const allUsers = [
      ...admins.map(admin => ({
        ...admin,
        id: `admin_${admin.id}`, // Prefix to avoid ID conflicts
        original_id: admin.id,
        original_table: 'admins'
      })),
      ...teachers.map(teacher => ({
        ...teacher,
        id: `teacher_${teacher.id}`,
        original_id: teacher.id,
        original_table: 'teachers'
      })),
      ...students.map(student => ({
        ...student,
        id: `student_${student.id}`,
        original_id: student.id,
        original_table: 'students'
      }))
    ];

    return allUsers;
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    throw error;
  }
};


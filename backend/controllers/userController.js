import db from "../database/dbconfig.js";

const dbp = db.promise();

export const getAllUsers = async (req, res) => {
    try {
        // Fetch all admins
        const [admins] = await dbp.query("SELECT id, first_name, last_name, email, role, created_at FROM admins");

        // Fetch all teachers
        const [teachers] = await dbp.query("SELECT id, full_name, email, created_at FROM teachers");

        // Fetch all students (both regular and IELTS/TOEFL)
        // Basic students
        const [students] = await dbp.query("SELECT id, full_name, email, approval_status as status, created_at FROM students");
        // IELTS students could be fetched too if needed, but for now focusing on main tables or maybe combining them.
        // Let's stick to the main tables requested: Admin, Teacher, Student.

        // Transform data to common structure
        const formattedAdmins = admins.map(user => ({
            id: `admin_${user.id}`,
            original_id: user.id,
            full_name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: 'admin',
            user_type: 'admin',
            status: 'active',
            created_at: user.created_at
        }));

        const formattedTeachers = teachers.map(user => ({
            id: `teacher_${user.id}`,
            original_id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'teacher',
            user_type: 'teacher',
            status: 'active',
            created_at: user.created_at
        }));

        const formattedStudents = students.map(user => ({
            id: `student_${user.id}`,
            original_id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            user_type: 'student',
            status: user.status || 'pending',
            created_at: user.created_at
        }));

        // Combine all users
        const allUsers = [...formattedAdmins, ...formattedTeachers, ...formattedStudents];

        // Sort by created_at desc
        allUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

import db from "../database/dbconfig.js";

const dbp = db.promise();

// Helper function to normalize status values
const normalizeStatus = (status) => {
    if (!status) return 'Active';

    const statusLower = status.toLowerCase();

    // Map database status values to Active/Inactive only
    if (statusLower === 'rejected' || statusLower === 'inactive') {
        return 'Inactive';
    }

    // Everything else (approved, active, pending, etc.) is Active
    return 'Active';
};

export const getAllUsers = async (req, res) => {
    try {
        // Fetch    // Admins
        const [admins] = await dbp.query("SELECT id, first_name, last_name, email, role, created_at FROM admins");

        // Teachers
        const [teachers] = await dbp.query("SELECT id, full_name, email, created_at FROM teachers");

        // Students
        const [students] = await dbp.query("SELECT student_id, full_name, email, approval_status as status, created_at FROM students");

        // IELTS/TOEFL Students
        const [ieltsStudents] = await dbp.query("SELECT student_id, CONCAT(first_name, ' ', last_name) as full_name, email, status, registration_date as created_at FROM IELTSTOEFL");

        // Transform data to common structure
        const formattedAdmins = admins.map(user => ({
            id: `admin_${user.id}`,
            original_id: user.id,
            full_name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: 'admin',
            user_type: 'admin',
            status: 'Active',
            created_at: user.created_at
        }));

        const formattedTeachers = teachers.map(user => ({
            id: `teacher_${user.id}`,
            original_id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: 'teacher',
            user_type: 'teacher',
            status: 'Active',
            created_at: user.created_at
        }));

        const formattedStudents = students.map(user => ({
            id: `student_${user.student_id}`,
            original_id: user.student_id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            user_type: 'student',
            status: normalizeStatus(user.status),
            created_at: user.created_at
        }));

        const formattedIeltsStudents = ieltsStudents.map(user => ({
            id: `ielts_${user.student_id}`,
            original_id: user.student_id,
            full_name: user.full_name,
            email: user.email,
            role: 'student',
            user_type: 'student',
            status: normalizeStatus(user.status),
            created_at: user.created_at
        }));

        // Combine all users
        const allUsers = [...formattedAdmins, ...formattedTeachers, ...formattedStudents, ...formattedIeltsStudents];

        // Sort by created_at desc
        allUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

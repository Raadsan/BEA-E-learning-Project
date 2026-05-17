import prisma from '../lib/prisma.js';

const normalizeStatus = (status) => {
    if (!status) return 'Active';
    const s = status.toLowerCase();
    return (s === 'rejected' || s === 'inactive') ? 'Inactive' : 'Active';
};

export const getAllUsers = async (req, res) => {
    try {
        const [admins, teachers, students, ieltsStudents] = await Promise.all([
            prisma.admins.findMany({ select: { id: true, first_name: true, last_name: true, email: true, role: true, created_at: true } }),
            prisma.teachers.findMany({ select: { id: true, full_name: true, email: true, created_at: true } }),
            prisma.students.findMany({ select: { student_id: true, full_name: true, email: true, approval_status: true, created_at: true } }),
            prisma.IELTSTOEFL.findMany({ select: { student_id: true, first_name: true, last_name: true, email: true, status: true, registration_date: true } })
        ]);

        const allUsers = [
            ...admins.map(u => ({ id: `admin_${u.id}`, original_id: u.id, full_name: `${u.first_name} ${u.last_name}`, email: u.email, role: 'admin', user_type: 'admin', status: 'Active', created_at: u.created_at })),
            ...teachers.map(u => ({ id: `teacher_${u.id}`, original_id: u.id, full_name: u.full_name, email: u.email, role: 'teacher', user_type: 'teacher', status: 'Active', created_at: u.created_at })),
            ...students.map(u => ({ id: `student_${u.student_id}`, original_id: u.student_id, full_name: u.full_name, email: u.email, role: 'student', user_type: 'student', status: normalizeStatus(u.approval_status), created_at: u.created_at })),
            ...ieltsStudents.map(u => ({ id: `ielts_${u.student_id}`, original_id: u.student_id, full_name: `${u.first_name} ${u.last_name}`, email: u.email, role: 'student', user_type: 'ielts_student', status: normalizeStatus(u.status), created_at: u.registration_date }))
        ];

        allUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(allUsers);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

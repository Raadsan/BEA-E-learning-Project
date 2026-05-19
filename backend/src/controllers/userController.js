import prisma from '../lib/prisma.js';

const normalizeStatus = (status) => {
    if (!status) return 'Active';
    const s = status.toLowerCase();
    return (s === 'rejected' || s === 'inactive') ? 'Inactive' : 'Active';
};

export const getAllUsers = async (req, res) => {
    try {
        const [admins, teachers, students, ieltsStudents] = await Promise.all([
            prisma.admins.findMany({ select: { id: true, first_name: true, last_name: true, email: true, role: true, profile_picture: true, created_at: true } }),
            prisma.teachers.findMany({ select: { id: true, full_name: true, email: true, profile_picture: true, created_at: true } }),
            prisma.students.findMany({ select: { student_id: true, full_name: true, email: true, profile_picture: true, approval_status: true, created_at: true } }),
            prisma.IELTSTOEFL.findMany({ select: { student_id: true, first_name: true, last_name: true, email: true, status: true, registration_date: true } })
        ]);

        const allUsers = [
            ...admins.map(u => ({ id: `admin_${u.id}`, original_id: u.id, full_name: `${u.first_name} ${u.last_name}`, email: u.email, role: 'admin', user_type: 'admin', profile_picture: u.profile_picture || null, status: 'Active', created_at: u.created_at })),
            ...teachers.map(u => ({ id: `teacher_${u.id}`, original_id: u.id, full_name: u.full_name, email: u.email, role: 'teacher', user_type: 'teacher', profile_picture: u.profile_picture || null, status: 'Active', created_at: u.created_at })),
            ...students.map(u => ({ id: `student_${u.student_id}`, original_id: u.student_id, full_name: u.full_name, email: u.email, role: 'student', user_type: 'student', profile_picture: u.profile_picture || null, status: normalizeStatus(u.approval_status), created_at: u.created_at })),
            ...ieltsStudents.map(u => ({ id: `ielts_${u.student_id}`, original_id: u.student_id, full_name: `${u.first_name} ${u.last_name}`, email: u.email, role: 'student', user_type: 'ielts_student', profile_picture: null, status: normalizeStatus(u.status), created_at: u.registration_date }))
        ];

        allUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(allUsers);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const bulkActionUsers = async (req, res) => {
    const { userIds, action } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs must be a non-empty array" });
    }
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (const userId of userIds) {
                const parts = userId.split('_');
                if (parts.length < 2) continue;
                const type = parts[0];
                const idString = parts.slice(1).join('_');
                const numericId = parseInt(idString, 10);

                if (type === 'admin') {
                    if (action === 'delete') {
                        await tx.admins.delete({ where: { id: numericId } });
                    } else {
                        await tx.admins.update({
                            where: { id: numericId },
                            data: { status: action === 'activate' ? 'active' : 'inactive' }
                        });
                    }
                } else if (type === 'teacher') {
                    if (action === 'delete') {
                        await tx.teachers.delete({ where: { id: numericId } });
                    } else {
                        await tx.teachers.update({
                            where: { id: numericId },
                            data: { status: action === 'activate' ? 'active' : 'inactive' }
                        });
                    }
                } else if (type === 'student') {
                    if (action === 'delete') {
                        await tx.students.delete({ where: { student_id: idString } });
                    } else {
                        await tx.students.update({
                            where: { student_id: idString },
                            data: { approval_status: action === 'activate' ? 'approved' : 'rejected' }
                        });
                    }
                } else if (type === 'ielts') {
                    if (action === 'delete') {
                        await tx.IELTSTOEFL.delete({ where: { student_id: idString } });
                    } else {
                        await tx.IELTSTOEFL.update({
                            where: { student_id: idString },
                            data: { status: action === 'activate' ? 'Approved' : 'Rejected' }
                        });
                    }
                }
            }
        });
        res.json({ message: `Bulk action ${action} completed successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

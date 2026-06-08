import prisma from '../lib/prisma.js';
import { createNotificationInternal } from './notificationController.js';
import { isSubprogramFullyCompleted, parseCompletedEntries } from '../utils/unitProgress.js';

export const createRequest = async (req, res) => {
    try {
        const { requested_subprogram_id, description } = req.body;
        const student_id = req.user.userId;
        if (!requested_subprogram_id) return res.status(400).json({ error: 'Subprogram ID required' });

        const student = await prisma.students.findUnique({ where: { student_id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const pending = await prisma.level_up_requests.findFirst({ where: { student_id, status: 'pending' } });
        if (pending) return res.status(400).json({ error: 'You already have a pending level-up request.' });

        const request = await prisma.level_up_requests.create({
            data: { student_id, requested_subprogram_id: parseInt(requested_subprogram_id), description }
        });

        await createNotificationInternal({
            user_id: null, sender_id: student_id, type: 'level_up_request',
            title: `[LEVEL UP] ${student.full_name} Ready for Next Level`,
            message: `${student.full_name} has completed their term and requests promotion.`,
            metadata: { requestId: request.id, studentName: student.full_name, requested_subprogram_id }
        });

        res.status(201).json(request);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const checkEligibility = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const student = await prisma.students.findUnique({ where: { student_id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Check if student has submitted a teacher review
        const review = await prisma.teacher_reviews.findFirst({ where: { student_id } });
        const hasCompletedEvaluation = !!review;

        // Check for existing pending request
        const existingPending = await prisma.level_up_requests.findFirst({ where: { student_id, status: 'pending' } });

        // Simplified grade check from assignment_submissions
        const submissions = await prisma.assignment_submissions.findMany({
            where: { student_id, status: 'graded' }
        });
        const totalEarned = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
        const totalPossible = submissions.length * 100;
        const avgGrades = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

        const studentClass = student.class_id
            ? await prisma.classes.findUnique({ where: { id: student.class_id } })
            : null;
        const currentSubprogramId = studentClass?.subprogram_id;
        const completedEntries = parseCompletedEntries(student.completed_subprograms);
        const hasCompletedCurrentLevel = currentSubprogramId
            ? isSubprogramFullyCompleted(completedEntries, currentSubprogramId)
            : false;

        const isEligible =
            avgGrades >= 50 &&
            hasCompletedEvaluation &&
            hasCompletedCurrentLevel &&
            !existingPending;

        res.json({
            isEligible,
            hasPending: !!existingPending,
            hasCompletedCurrentLevel,
            details: {
                grades: avgGrades.toFixed(2),
                teacherReview: hasCompletedEvaluation,
            },
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllRequests = async (req, res) => {
    try {
        const requests = await prisma.level_up_requests.findMany({
            include: { students: true, subprograms: true },
            orderBy: { created_at: 'desc' }
        });

        const flattened = requests.map(request => ({
            ...request,
            student_name: request.students?.full_name || '-',
            requested_subprogram_name: request.subprograms?.subprogram_name || '-'
        }));

        res.json(flattened);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyRequests = async (req, res) => {
    try {
        const requests = await prisma.level_up_requests.findMany({
            where: { student_id: req.user.userId },
            include: { subprograms: true },
            orderBy: { created_at: 'desc' }
        });

        const flattened = requests.map(request => ({
            ...request,
            requested_subprogram_name: request.subprograms?.subprogram_name || '-'
        }));

        res.json(flattened);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response, new_class_id, new_subprogram_id } = req.body;
        if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const reqItem = await prisma.level_up_requests.findUnique({ where: { id: parseInt(id) } });
        if (!reqItem) return res.status(404).json({ error: 'Not found' });

        await prisma.level_up_requests.update({ where: { id: parseInt(id) }, data: { status, admin_response } });

        if (status === 'approved' && new_class_id && new_subprogram_id) {
            await prisma.students.update({
                where: { student_id: reqItem.student_id },
                data: { class_id: parseInt(new_class_id), chosen_subprogram: String(new_subprogram_id) }
            });
        }

        await createNotificationInternal({
            user_id: reqItem.student_id, sender_id: null, type: 'level_up_response',
            title: `Level-Up Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your level-up request has been ${status}. ${admin_response ? 'Note: ' + admin_response : ''}`,
            metadata: { requestId: id, status, adminResponse: admin_response }
        });

        res.json({ message: `Level-up request ${status}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

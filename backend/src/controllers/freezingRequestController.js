import prisma from '../lib/prisma.js';
import { createNotificationInternal } from './notificationController.js';

export const createRequest = async (req, res) => {
    try {
        const { reason, start_date, end_date, description } = req.body;
        const student_id = req.user.userId;
        if (!reason || !start_date || !end_date) return res.status(400).json({ error: 'Reason, start and end date required' });

        const request = await prisma.freezing_requests.create({
            data: { student_id, reason, start_date: new Date(start_date), end_date: new Date(end_date), description }
        });

        const student = await prisma.students.findUnique({ where: { student_id } });
        const studentName = student?.full_name || 'A student';

        await createNotificationInternal({
            user_id: null, sender_id: student_id, type: 'freezing_request',
            title: 'Course Freezing Request',
            message: `${studentName} wants to freeze their course from ${start_date} to ${end_date}.`,
            metadata: { requestId: request.id, studentName, reason, startDate: start_date, endDate: end_date }
        });

        res.status(201).json(request);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllRequests = async (req, res) => {
    try {
        const requests = await prisma.freezing_requests.findMany({ orderBy: { created_at: 'desc' } });

        const populated = await Promise.all(requests.map(async (request) => {
            let student_name = '-';
            let student_email = '-';

            if (request.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: request.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    student_email = student.email || '-';
                }
            }

            return {
                ...request,
                student_name,
                student_email
            };
        }));

        res.json(populated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyRequests = async (req, res) => {
    try {
        const requests = await prisma.freezing_requests.findMany({
            where: { student_id: req.user.userId }, orderBy: { created_at: 'desc' }
        });

        const populated = await Promise.all(requests.map(async (request) => {
            let student_name = '-';
            let student_email = '-';

            if (request.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: request.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    student_email = student.email || '-';
                }
            }

            return {
                ...request,
                student_name,
                student_email
            };
        }));

        res.json(populated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;
        if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const existing = await prisma.freezing_requests.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ error: 'Not found' });

        await prisma.freezing_requests.update({ where: { id: parseInt(id) }, data: { status, admin_response } });

        await createNotificationInternal({
            user_id: existing.student_id, sender_id: null, type: 'freezing_response',
            title: `Freezing Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your freezing request has been ${status}.`,
            metadata: { requestId: id, status, adminResponse: admin_response }
        });

        res.json({ message: `Request ${status}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

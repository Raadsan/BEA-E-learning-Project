import prisma from '../lib/prisma.js';
import { createNotificationInternal } from './notificationController.js';

// Policy constants
const MAX_FREEZE_DAYS = 30;
const MAX_APPROVED_FREEZES = 2;

export const createRequest = async (req, res) => {
    try {
        const { reason, start_date, end_date, description } = req.body;
        const student_id = req.user.userId;
        if (!reason || !start_date || !end_date) return res.status(400).json({ error: 'Reason, start and end date required' });

        const student = await prisma.students.findUnique({ where: { student_id } });
        const studentName = student?.full_name || 'A student';

        // Helper: create + immediately update to rejected (bypasses MySQL DEFAULT override on create)
        const autoReject = async (autoRejectReason) => {
            const record = await prisma.freezing_requests.create({
                data: { student_id, reason, description, start_date: new Date(start_date), end_date: new Date(end_date) }
            });
            const rejected = await prisma.freezing_requests.update({
                where: { id: record.id },
                data: { status: 'rejected', admin_response: autoRejectReason }
            });
            await createNotificationInternal({
                user_id: student_id, sender_id: null, type: 'freezing_response',
                title: 'Freezing Request Rejected',
                message: autoRejectReason,
                metadata: { requestId: rejected.id, status: 'rejected', adminResponse: autoRejectReason }
            });
            return rejected;
        };

        // --- Policy Check 1: Duration limit ---
        const durationDays = Math.ceil(
            (new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (durationDays > MAX_FREEZE_DAYS) {
            const msg = `Your request was automatically rejected: the requested freeze duration is ${durationDays} days, which exceeds the maximum allowed limit of ${MAX_FREEZE_DAYS} days.`;
            const rejected = await autoReject(msg);
            return res.status(422).json({ error: msg, auto_rejected: true, request: rejected });
        }

        // --- Policy Check 2: Max approved freezes limit ---
        const approvedCount = await prisma.freezing_requests.count({
            where: { student_id, status: 'approved' }
        });
        if (approvedCount >= MAX_APPROVED_FREEZES) {
            const msg = `Your request was automatically rejected: you have already used ${approvedCount} approved freeze(s). The maximum allowed is ${MAX_APPROVED_FREEZES} per student.`;
            const rejected = await autoReject(msg);
            return res.status(422).json({ error: msg, auto_rejected: true, request: rejected });
        }

        // --- All checks passed: create pending request ---
        const request = await prisma.freezing_requests.create({
            data: { student_id, reason, start_date: new Date(start_date), end_date: new Date(end_date), description }
        });

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

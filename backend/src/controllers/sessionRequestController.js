import prisma from '../lib/prisma.js';
import { createNotificationInternal } from './notificationController.js';

export const createRequest = async (req, res) => {
    try {
        const { current_class_id, requested_class_id, requested_session_type, reason } = req.body;
        const student_id = req.user.userId;
        if (!requested_session_type || !reason) return res.status(400).json({ error: 'Session type and reason required' });

        const request = await prisma.session_change_requests.create({
            data: {
                student_id,
                current_class_id: current_class_id ? parseInt(current_class_id) : null,
                requested_class_id: requested_class_id ? parseInt(requested_class_id) : null,
                requested_session_type, reason
            }
        });

        const student = await prisma.students.findUnique({ where: { student_id } });
        await createNotificationInternal({
            user_id: null, sender_id: student_id, type: 'session_change',
            title: 'Session Change Request',
            message: `${student?.full_name || 'A student'} requests session change to ${requested_session_type}.`,
            metadata: { requestId: request.id, requestedSession: requested_session_type, reason }
        });

        res.status(201).json(request);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllRequests = async (req, res) => {
    try {
        const requests = await prisma.session_change_requests.findMany({ orderBy: { created_at: 'desc' } });

        const populated = await Promise.all(requests.map(async (request) => {
            let student_name = '-';
            let program_name = '-';
            let subprogram_name = '-';
            let current_class_name = 'N/A';
            let current_shift_name = '';
            let current_session_type = '';
            let requested_class_name = 'N/A';
            let requested_shift_name = '';
            let requested_class_type = '';

            if (request.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: request.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    program_name = student.chosen_program || '-';
                    subprogram_name = student.chosen_subprogram || '-';
                }
            }

            if (request.current_class_id) {
                const cls = await prisma.classes.findUnique({
                    where: { id: request.current_class_id },
                    include: { shifts: true }
                });
                if (cls) {
                    current_class_name = cls.class_name || 'N/A';
                    if (cls.shifts) {
                        current_shift_name = cls.shifts.shift_name || '';
                        current_session_type = cls.shifts.session_type || '';
                    }
                }
            }

            if (request.requested_class_id) {
                const reqCls = await prisma.classes.findUnique({
                    where: { id: request.requested_class_id },
                    include: { shifts: true }
                });
                if (reqCls) {
                    requested_class_name = reqCls.class_name || 'N/A';
                    if (reqCls.shifts) {
                        requested_shift_name = reqCls.shifts.shift_name || '';
                        requested_class_type = reqCls.shifts.session_type || '';
                    }
                }
            }

            return {
                ...request,
                student_name,
                program_name,
                subprogram_name,
                current_class_name,
                current_shift_name,
                current_session_type,
                requested_class_name,
                requested_shift_name,
                requested_class_type
            };
        }));

        res.json(populated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyRequests = async (req, res) => {
    try {
        const requests = await prisma.session_change_requests.findMany({
            where: { student_id: req.user.userId }, orderBy: { created_at: 'desc' }
        });

        const populated = await Promise.all(requests.map(async (request) => {
            let student_name = '-';
            let program_name = '-';
            let subprogram_name = '-';
            let current_class_name = 'N/A';
            let current_shift_name = '';
            let current_session_type = '';
            let requested_class_name = 'N/A';
            let requested_shift_name = '';
            let requested_class_type = '';

            if (request.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: request.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    program_name = student.chosen_program || '-';
                    subprogram_name = student.chosen_subprogram || '-';
                }
            }

            if (request.current_class_id) {
                const cls = await prisma.classes.findUnique({
                    where: { id: request.current_class_id },
                    include: { shifts: true }
                });
                if (cls) {
                    current_class_name = cls.class_name || 'N/A';
                    if (cls.shifts) {
                        current_shift_name = cls.shifts.shift_name || '';
                        current_session_type = cls.shifts.session_type || '';
                    }
                }
            }

            if (request.requested_class_id) {
                const reqCls = await prisma.classes.findUnique({
                    where: { id: request.requested_class_id },
                    include: { shifts: true }
                });
                if (reqCls) {
                    requested_class_name = reqCls.class_name || 'N/A';
                    if (reqCls.shifts) {
                        requested_shift_name = reqCls.shifts.shift_name || '';
                        requested_class_type = reqCls.shifts.session_type || '';
                    }
                }
            }

            return {
                ...request,
                student_name,
                program_name,
                subprogram_name,
                current_class_name,
                current_shift_name,
                current_session_type,
                requested_class_name,
                requested_shift_name,
                requested_class_type
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

        const sessionReq = await prisma.session_change_requests.findUnique({ where: { id: parseInt(id) } });
        if (!sessionReq) return res.status(404).json({ error: 'Not found' });

        await prisma.session_change_requests.update({ where: { id: parseInt(id) }, data: { status, admin_response } });

        if (status === 'approved' && sessionReq.requested_class_id) {
            await prisma.students.update({
                where: { student_id: sessionReq.student_id },
                data: { class_id: sessionReq.requested_class_id }
            });
        }

        await createNotificationInternal({
            user_id: sessionReq.student_id, sender_id: null, type: 'session_change_response',
            title: `Session Change ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your session change request has been ${status}.`,
            metadata: { requestId: id, status, adminResponse: admin_response }
        });

        res.json({ message: `Request ${status}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

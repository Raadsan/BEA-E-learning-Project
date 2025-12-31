import * as SessionRequestModel from "../models/sessionRequestModel.js";
import * as StudentModel from "../models/studentModel.js";
import { createNotificationInternal } from "./notificationController.js";

// Create Request
export const createRequest = async (req, res) => {
    try {
        const { current_class_id, requested_class_id, requested_session_type, reason } = req.body;
        const student_id = req.user.userId; // Corrected from req.user.id

        if (!requested_session_type || !reason) {
            return res.status(400).json({ error: "Session type and reason are required" });
        }

        const newRequest = await SessionRequestModel.createSessionRequest({
            student_id,
            current_class_id,
            requested_class_id,
            requested_session_type,
            reason
        });

        // Fetch user name if not in token
        const student = await StudentModel.getStudentById(student_id);
        const studentName = student?.full_name || req.user.email || "A student";

        // Trigger Notification to Admin
        await createNotificationInternal({
            user_id: null, // Admin
            sender_id: student_id,
            type: "session_change",
            title: "Session Change Request",
            message: `${studentName} requests session change to ${requested_session_type}.`,
            metadata: {
                requestId: newRequest.id,
                currentSession: "See Request",
                requestedSession: requested_session_type,
                reason,
                studentName: studentName,
                currentClassId: current_class_id,
                requestedClassId: requested_class_id
            }
        });

        res.status(201).json(newRequest);
    } catch (err) {
        console.error("Create session request error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get Requests (Admin)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await SessionRequestModel.getSessionRequests();
        res.json(requests);
    } catch (err) {
        console.error("Get session requests error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get My Requests (Student)
export const getMyRequests = async (req, res) => {
    try {
        const student_id = req.user.userId; // Corrected from req.user.id
        const requests = await SessionRequestModel.getRequestsByStudentId(student_id);
        res.json(requests);
    } catch (err) {
        console.error("Get my session requests error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Update Request Status (Admin Action)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // 1. Get request details
        const requests = await SessionRequestModel.getSessionRequests();
        const sessionRequest = requests.find(r => r.id == id);

        if (!sessionRequest) {
            return res.status(404).json({ error: "Request not found" });
        }

        // 2. Update status in DB
        await SessionRequestModel.updateSessionRequestStatus(id, status, admin_response);

        // 3. If approved, update student's class
        if (status === 'approved' && sessionRequest.requested_class_id) {
            await StudentModel.updateStudentById(sessionRequest.student_id, {
                class_id: sessionRequest.requested_class_id
            });
        }

        // 4. Notify Student
        await createNotificationInternal({
            user_id: sessionRequest.student_id,
            sender_id: null, // System/Admin
            type: "session_change_response",
            title: `Session Change ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your request to change session to ${sessionRequest.requested_session_type} has been ${status}. ${admin_response ? 'Note: ' + admin_response : ''}`,
            metadata: {
                requestId: id,
                status,
                adminResponse: admin_response
            }
        });

        res.json({ message: `Request ${status} successfully` });
    } catch (err) {
        console.error("Update session request status error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

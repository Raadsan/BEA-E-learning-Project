
import * as FreezingRequestModel from "../models/freezingRequestModel.js";
import * as StudentModel from "../models/studentModel.js";
import * as ClassModel from "../models/classModel.js";
import { createNotificationInternal } from "./notificationController.js";

// Create Freezing Request
export const createRequest = async (req, res) => {
    try {
        const { reason, start_date, end_date, description } = req.body;
        const student_id = req.user.userId;

        if (!reason || !start_date || !end_date) {
            return res.status(400).json({ error: "Reason, start date, and end date are required" });
        }

        const newRequest = await FreezingRequestModel.createFreezingRequest({
            student_id,
            reason,
            start_date,
            end_date,
            description
        });

        // Fetch student name
        const student = await StudentModel.getStudentById(student_id);
        const studentName = student?.full_name || req.user.email || "A student";

        // Trigger Notification to Admin
        await createNotificationInternal({
            user_id: null, // Admin broadcast
            sender_id: student_id,
            type: "freezing_request",
            title: "Course Freezing Request",
            message: `${studentName} wants to freeze their course from ${start_date} to ${end_date}.`,
            metadata: {
                requestId: newRequest.id,
                studentName,
                reason,
                startDate: start_date,
                endDate: end_date,
                description
            }
        });

        // Trigger Notification to Teacher
        if (student?.class_id) {
            const classData = await ClassModel.getClassById(student.class_id);
            if (classData?.teacher_id) {
                await createNotificationInternal({
                    user_id: classData.teacher_id,
                    sender_id: student_id,
                    type: "freezing_request",
                    title: "Student Freezing Request",
                    message: `Your student ${studentName} has requested to freeze their course.`,
                    metadata: {
                        requestId: newRequest.id,
                        studentName,
                        reason,
                        startDate: start_date,
                        endDate: end_date
                    }
                });
            }
        }

        res.status(201).json(newRequest);
    } catch (err) {
        console.error("Create freezing request error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get All Requests (Admin)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await FreezingRequestModel.getFreezingRequests();
        res.json(requests);
    } catch (err) {
        console.error("Get all freezing requests error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get Requests for Student
export const getMyRequests = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const requests = await FreezingRequestModel.getFreezingRequestsByStudentId(student_id);
        res.json(requests);
    } catch (err) {
        console.error("Get student freezing requests error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Update Request Status (Admin)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Get student ID before updating
        const rows = await FreezingRequestModel.getFreezingRequests();
        const reqItem = rows.find(r => r.id == id);

        if (!reqItem) {
            return res.status(404).json({ error: "Request not found" });
        }

        await FreezingRequestModel.updateFreezingRequestStatus(id, status, admin_response);

        // Trigger Notification to Student
        await createNotificationInternal({
            user_id: reqItem.student_id,
            sender_id: null, // System notification
            type: "freezing_response",
            title: `Freezing Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your freezing request from ${reqItem.start_date} has been ${status}.`,
            metadata: {
                requestId: id,
                status,
                adminResponse: admin_response,
                startDate: reqItem.start_date,
                endDate: reqItem.end_date
            }
        });

        res.json({ message: `Request ${status} successfully` });
    } catch (err) {
        console.error("Update freezing status error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

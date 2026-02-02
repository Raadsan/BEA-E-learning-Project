
import * as LevelUpRequestModel from "../models/levelUpRequestModel.js";
import * as StudentModel from "../models/studentModel.js";
import { createNotificationInternal } from "./notificationController.js";

// Create Level-Up Request
export const createRequest = async (req, res) => {
    try {
        const { requested_subprogram_id } = req.body;
        const student_id = req.user.userId;

        if (!requested_subprogram_id) {
            return res.status(400).json({ error: "Requested subprogram ID is required" });
        }

        const newRequest = await LevelUpRequestModel.createLevelUpRequest({
            student_id,
            requested_subprogram_id
        });

        // Fetch student name
        const student = await StudentModel.getStudentById(student_id);
        const studentName = student?.full_name || req.user.email || "A student";

        // Trigger Notification to Admin
        await createNotificationInternal({
            user_id: null, // Admin broadcast
            sender_id: student_id,
            type: "level_up_request",
            title: `[LEVEL UP] ${studentName} Ready for Next Level`,
            message: `${studentName} has completed their term and is requesting promotion to a new level.`,
            metadata: {
                requestId: newRequest.id,
                studentName,
                requested_subprogram_id
            }
        });

        res.status(201).json(newRequest);
    } catch (err) {
        console.error("Create level-up request error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get All Requests (Admin)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await LevelUpRequestModel.getLevelUpRequests();
        res.json(requests);
    } catch (err) {
        console.error("Get all level-up requests error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get Requests for Student
export const getMyRequests = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const requests = await LevelUpRequestModel.getLevelUpRequestsByStudentId(student_id);
        res.json(requests);
    } catch (err) {
        console.error("Get student level-up requests error:", err);
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

        const rows = await LevelUpRequestModel.getLevelUpRequests();
        const reqItem = rows.find(r => r.id == id);

        if (!reqItem) {
            return res.status(404).json({ error: "Request not found" });
        }

        await LevelUpRequestModel.updateLevelUpRequestStatus(id, status, admin_response);

        // Trigger Notification to Student
        await createNotificationInternal({
            user_id: reqItem.student_id,
            sender_id: null, // System notification
            type: "level_up_response",
            title: `Level-Up Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your level-up request for ${reqItem.requested_subprogram_name} has been ${status}. ${admin_response ? 'Admin Note: ' + admin_response : ''}`,
            metadata: {
                requestId: id,
                status,
                adminResponse: admin_response
            }
        });

        res.json({ message: `Level-up request ${status} successfully` });
    } catch (err) {
        console.error("Update level-up status error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

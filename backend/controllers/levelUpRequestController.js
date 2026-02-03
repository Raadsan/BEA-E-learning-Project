import * as LevelUpRequestModel from "../models/levelUpRequestModel.js";
import * as StudentModel from "../models/studentModel.js";
import { createNotificationInternal } from "./notificationController.js";
import db from "../database/dbconfig.js";

const dbp = db.promise();

// Create Level-Up Request
export const createRequest = async (req, res) => {
    try {
        const { requested_subprogram_id, description } = req.body;
        const student_id = req.user.userId;

        console.log(`[LevelUp] Creating request for student: ${student_id}, target subprogram: ${requested_subprogram_id}`);

        if (!requested_subprogram_id) {
            console.warn(`[LevelUp] Failed: requested_subprogram_id is missing`);
            return res.status(400).json({ error: "Requested subprogram ID is required" });
        }

        // Check if student exists
        const student = await StudentModel.getStudentById(student_id);
        if (!student) {
            console.warn(`[LevelUp] Failed: Student ${student_id} not found`);
            return res.status(404).json({ error: "Student not found" });
        }

        // Check for existing pending request
        const [pending] = await dbp.query(
            "SELECT id FROM level_up_requests WHERE student_id = ? AND status = 'pending'",
            [student_id]
        );
        if (pending.length > 0) {
            console.warn(`[LevelUp] Failed: Pending request already exists for student ${student_id}`);
            return res.status(400).json({ error: "You already have a pending level-up request." });
        }

        const newRequest = await LevelUpRequestModel.createLevelUpRequest({
            student_id,
            requested_subprogram_id,
            description
        });

        console.log(`[LevelUp] Success: Request ${newRequest.id} created`);

        // Fetch student name for notification
        const studentName = student.full_name || req.user.email || "A student";

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
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

// Check Eligibility
export const checkEligibility = async (req, res) => {
    try {
        const student_id = req.user.userId;

        // 1. Get student current class and subprogram
        const student = await StudentModel.getStudentById(student_id);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Determine the subprogram we are checking eligibility for
        let class_id = student.class_id;
        let subId = student.chosen_subprogram;

        // If they have a class, try to get the subprogram from it for accuracy
        if (class_id) {
            const [clsRows] = await dbp.query("SELECT subprogram_id FROM classes WHERE id = ?", [class_id]);
            if (clsRows && clsRows.length > 0) {
                subId = clsRows[0].subprogram_id;
            }
        }

        if (!subId) {
            return res.json({
                isEligible: false,
                reason: "No active level assigned",
                details: { grades: 0, attendance: 0, teacherReview: false }
            });
        }

        // 2. Calculate average grades (Matching student portal "Success Rate" logic)
        // We aggregate from all 4 major assignment tables for the current level (subId)
        const [gradeRows] = await dbp.query(
            `SELECT SUM(earned) as total_earned, SUM(possible) as total_possible FROM (
                -- Writing Tasks (Wait: join classes to get subprogram_id)
                SELECT s.score as earned, a.total_points as possible 
                FROM writing_task_submissions s 
                JOIN writing_tasks a ON s.assignment_id = a.id 
                LEFT JOIN classes c ON a.class_id = c.id
                WHERE s.student_id = ? AND s.status = 'graded' AND (c.subprogram_id = ? OR a.class_id = ?)
                
                UNION ALL
                
                -- Exams (has subprogram_id)
                SELECT s.score as earned, a.total_points as possible 
                FROM exam_submissions s 
                JOIN exams a ON s.assignment_id = a.id 
                LEFT JOIN classes c ON a.class_id = c.id
                WHERE s.student_id = ? AND s.status = 'graded' AND (a.subprogram_id = ? OR c.subprogram_id = ? OR a.class_id = ?)
                
                UNION ALL
                
                -- Oral Assignments (has subprogram_id)
                SELECT s.score as earned, a.total_points as possible 
                FROM oral_assignment_submissions s 
                JOIN oral_assignments a ON s.assignment_id = a.id 
                LEFT JOIN classes c ON a.class_id = c.id
                WHERE s.student_id = ? AND s.status = 'graded' AND (a.subprogram_id = ? OR c.subprogram_id = ? OR a.class_id = ?)
                
                UNION ALL
                
                -- Course Work (has subprogram_id)
                SELECT s.score as earned, a.total_points as possible 
                FROM course_work_submissions s 
                JOIN course_work a ON s.assignment_id = a.id 
                LEFT JOIN classes c ON a.class_id = c.id
                WHERE s.student_id = ? AND s.status = 'graded' AND (a.subprogram_id = ? OR c.subprogram_id = ? OR a.class_id = ?)
            ) as all_grades`,
            [
                student_id, subId, class_id,
                student_id, subId, subId, class_id,
                student_id, subId, subId, class_id,
                student_id, subId, subId, class_id
            ]
        );
        const earned = parseFloat(gradeRows[0]?.total_earned) || 0;
        const possible = parseFloat(gradeRows[0]?.total_possible) || 0;
        const avgGrades = possible > 0 ? (earned / possible) * 100 : 0;

        // 3. Calculate attendance percentage (Optional for eligibility now, but kept in details)
        const [attendanceRows] = await dbp.query(
            `SELECT 
                SUM(CASE WHEN hour1 = 1 THEN 1 ELSE 0 END + CASE WHEN hour2 = 1 THEN 1 ELSE 0 END) as attended_hours,
                COUNT(*) * 2 as total_hours
             FROM attendance
             WHERE student_id = ? ${class_id ? 'AND class_id = ?' : ''}`,
            class_id ? [student_id, class_id] : [student_id]
        );
        const attended = attendanceRows[0]?.attended_hours || 0;
        const total = attendanceRows[0]?.total_hours || 0;
        const attendancePercent = total > 0 ? (attended / total) * 100 : 0;

        // 4. Check for student reviews of teachers (Student Evaluating Instructor)
        // We look for ANY review by this student.
        const [reviewRows] = await dbp.query(
            `SELECT COUNT(*) as review_count FROM teacher_reviews WHERE student_id = ?`,
            [student_id]
        );
        const hasCompletedEvaluation = reviewRows[0]?.review_count > 0;

        // 5. Check for existing pending request
        const [existingRequests] = await dbp.query(
            "SELECT id FROM level_up_requests WHERE student_id = ? AND status = 'pending'",
            [student_id]
        );

        const isEligible = avgGrades >= 50 && hasCompletedEvaluation && existingRequests.length === 0;

        // Log for developer convenience (visible if we could see logs, but also returned in details)
        console.log(`[LevelUp Check] Student: ${student_id}, Grade: ${avgGrades}%, Review: ${hasCompletedEvaluation}, Pending: ${existingRequests.length > 0}`);

        res.json({
            isEligible,
            hasPending: existingRequests.length > 0,
            details: {
                grades: avgGrades.toFixed(2),
                grades_raw: { earned, possible },
                attendance: attendancePercent.toFixed(2),
                teacherReview: hasCompletedEvaluation,
                evaluation: hasCompletedEvaluation, // support both keys just in case
                reason: !hasCompletedEvaluation ? "Missing teacher evaluation" : (avgGrades < 50 ? "Grades below 50%" : (existingRequests.length > 0 ? "Pending request exists" : ""))
            }
        });

    } catch (err) {
        console.error("Check eligibility error:", err);
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

        // Additional Logic for Promotion or Reassignment
        if (status === 'approved') {
            const { new_class_id, new_subprogram_id } = req.body;
            if (new_class_id && new_subprogram_id) {
                // Update student level and class
                await dbp.query(
                    "UPDATE students SET chosen_subprogram = ?, class_id = ? WHERE student_id = ?",
                    [new_subprogram_id, new_class_id, reqItem.student_id]
                );

                // Add to history (following pattern in studentController)
                await dbp.query(
                    "INSERT IGNORE INTO student_class_history (student_id, class_id, subprogram_id, is_active) VALUES (?, ?, ?, 1)",
                    [reqItem.student_id, new_class_id, new_subprogram_id]
                );
                await dbp.query(
                    "UPDATE student_class_history SET is_active = 0 WHERE student_id = ? AND subprogram_id != ? AND class_id != ?",
                    [reqItem.student_id, new_subprogram_id, new_class_id]
                );
            }
        } else if (status === 'rejected') {
            const { new_class_id } = req.body;
            if (new_class_id) {
                // Reassign to a different class in the SAME subprogram
                await dbp.query(
                    "UPDATE students SET class_id = ? WHERE student_id = ?",
                    [new_class_id, reqItem.student_id]
                );

                // Fetch subprogram details for history
                const [cls] = await dbp.query("SELECT subprogram_id FROM classes WHERE id = ?", [new_class_id]);
                const subId = cls[0]?.subprogram_id;

                if (subId) {
                    await dbp.query(
                        "INSERT IGNORE INTO student_class_history (student_id, class_id, subprogram_id, is_active) VALUES (?, ?, ?, 1)",
                        [reqItem.student_id, new_class_id, subId]
                    );
                    await dbp.query(
                        "UPDATE student_class_history SET is_active = 0 WHERE student_id = ? AND class_id != ?",
                        [reqItem.student_id, new_class_id]
                    );
                }
            }
        }

        // Trigger Notification to Student
        await createNotificationInternal({
            user_id: reqItem.student_id,
            sender_id: null, // System notification
            type: "level_up_response",
            title: `Level-Up Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your level-up request has been ${status}. ${admin_response ? 'Admin Note: ' + admin_response : ''}`,
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

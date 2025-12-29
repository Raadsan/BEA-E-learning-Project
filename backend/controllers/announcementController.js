import * as announcementModel from "../models/announcementModel.js";
import * as studentModel from "../models/studentModel.js";
import * as teacherModel from "../models/teacherModel.js";
import * as classModel from "../models/classModel.js";

export const getAnnouncements = async (req, res) => {
    try {
        const { classId } = req.query;
        let announcements;

        if (classId) {
            announcements = await announcementModel.getAnnouncementsByClass(classId);
        } else {
            announcements = await announcementModel.getAllAnnouncements();
        }

        res.status(200).json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const newAnnouncement = await announcementModel.createAnnouncement(req.body);
        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Failed to create announcement" });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await announcementModel.updateAnnouncement(id, req.body);

        // Use 200 even if result is 0 (might mean no changes were needed)
        // Ideally we should check if ID exists, but for now this fixes the 404 on "save same data"
        res.status(200).json({ message: "Announcement updated successfully" });
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: "Failed to update announcement" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await announcementModel.deleteAnnouncement(id);
        if (result === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: "Failed to delete announcement" });
    }
};

export const sendClassNotification = async (req, res) => {
    try {
        console.log("📥 sendClassNotification called with:", {
            classId: req.params.classId,
            body: req.body,
            headers: req.headers.authorization ? "Has auth header" : "No auth header"
        });

        const { classId } = req.params;
        const { title, content, targetType, studentId } = req.body;

        if (!title || !content || !targetType) {
            return res.status(400).json({ message: "Title, content, and target type are required" });
        }

        // Get class information
        const classInfo = await classModel.getClassById(classId);
        if (!classInfo) {
            return res.status(404).json({ message: "Class not found" });
        }

        let recipients = [];
        let targetAudience = "";

        if (targetType === "all_students_and_teacher") {
            // Get all approved students in the class
            const students = await studentModel.getStudentsByClassId(classId);
            recipients = students.map(student => ({
                id: student.id,
                email: student.email,
                name: student.full_name,
                type: "student"
            }));

            // Add teacher
            if (classInfo.teacher_id) {
                const teacher = await teacherModel.getTeacherById(classInfo.teacher_id);
                if (teacher) {
                    recipients.push({
                        id: teacher.id,
                        email: teacher.email,
                        name: teacher.full_name,
                        type: "teacher"
                    });
                }
            }

            targetAudience = `Class ${classInfo.class_name} - All Students and Teacher`;
        } else if (targetType === "all_students") {
            // Get all approved students in the class
            const students = await studentModel.getStudentsByClassId(classId);
            recipients = students.map(student => ({
                id: student.id,
                email: student.email,
                name: student.full_name,
                type: "student"
            }));

            targetAudience = `Class ${classInfo.class_name} - All Students`;
        } else if (targetType === "student_by_id") {
            if (!studentId) {
                return res.status(400).json({ message: "Student ID is required for individual notifications" });
            }

            // Verify student is in the class
            const students = await studentModel.getStudentsByClassId(classId);
            const student = students.find(s => s.id == studentId);

            if (!student) {
                return res.status(404).json({ message: "Student not found in this class" });
            }

            recipients = [{
                id: student.id,
                email: student.email,
                name: student.full_name,
                type: "student"
            }];

            targetAudience = `Class ${classInfo.class_name} - Student: ${student.full_name}`;
        } else {
            return res.status(400).json({ message: "Invalid target type" });
        }

        if (recipients.length === 0) {
            return res.status(400).json({ message: "No recipients found for the specified criteria" });
        }

        // Create the announcement
        const announcement = await announcementModel.createAnnouncement({
            title,
            content,
            targetAudience,
            publishDate: new Date().toISOString().split('T')[0], // Today's date
            status: "Published"
        });

        // TODO: Send actual emails to recipients
        // For now, just log the recipients
        console.log("Notification recipients:", recipients.map(r => `${r.name} (${r.email})`));

        res.status(201).json({
            message: "Notification sent successfully",
            announcement,
            recipientsCount: recipients.length,
            recipients: recipients.map(r => ({ name: r.name, email: r.email, type: r.type }))
        });

    } catch (error) {
        console.error("Error sending class notification:", error);
        res.status(500).json({ message: "Failed to send notification" });
    }
};

export const getTeacherAnnouncements = async (req, res) => {
    try {
        const teacherId = req.user.userId;

        // 1. Get classes taught by teacher
        const classes = await classModel.getClassesByTeacherId(teacherId);
        const classIds = classes.map(c => c.id);

        // 2. Fetch announcements
        const announcements = await announcementModel.getAnnouncementsForTeacher(teacherId, classIds);

        res.status(200).json(announcements);
    } catch (error) {
        console.error("Error fetching teacher announcements:", error);
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
};

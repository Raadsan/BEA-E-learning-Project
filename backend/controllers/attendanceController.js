import * as Attendance from "../models/attendanceModel.js";

// SAVE ATTENDANCE (Bulk or Single)
export const saveAttendance = async (req, res) => {
    try {
        const { class_id, date, attendanceData } = req.body;
        // attendanceData: { studentId: { hour1: bool, hour2: bool } }

        if (!class_id || !date || !attendanceData) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Process each student's attendance
        const promises = Object.entries(attendanceData).map(async ([studentId, status]) => {
            await Attendance.markAttendance({
                class_id,
                student_id: studentId,
                date,
                hour1: status.hour1,
                hour2: status.hour2
            });
        });

        await Promise.all(promises);

        res.json({ message: "Attendance saved successfully" });
    } catch (err) {
        console.error("Save attendance error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// GET ATTENDANCE
export const getAttendance = async (req, res) => {
    try {
        const { classId, date } = req.params;

        if (!classId || !date) {
            return res.status(400).json({ error: "Missing classId or date" });
        }

        const records = await Attendance.getAttendance(classId, date);

        // Transform to frontend format: { studentId: { hour1: bool, hour2: bool } }
        const formatted = {};
        records.forEach(record => {
            formatted[record.student_id] = {
                hour1: !!record.hour1,
                hour2: !!record.hour2
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error("Get attendance error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// GET ATTENDANCE REPORT
export const getAttendanceReport = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: "Access denied" });
        }

        const report = await Attendance.getAttendanceReportByTeacherId(teacherId);
        res.json(report);
    } catch (err) {
        console.error("Get report error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

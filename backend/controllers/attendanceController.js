import * as Attendance from "../models/attendanceModel.js";
import * as Class from "../models/classModel.js";

// SAVE ATTENDANCE (Bulk or Single)
export const saveAttendance = async (req, res) => {
    try {
        const { class_id, date, attendanceData } = req.body;
        // attendanceData: { studentId: { hour1: bool, hour2: bool } }

        if (!class_id || !date || !attendanceData) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if teacher is assigned to the class
        if (req.user.role === 'teacher') {
            const classItem = await Class.getClassById(class_id);
            if (!classItem || classItem.teacher_id !== req.user.userId) {
                return res.status(403).json({ error: "Access denied" });
            }
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

        // Validate date to prevent SQL crashes (e.g. if 'summary' is passed)
        if (date === 'summary' || isNaN(Date.parse(date))) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Check if teacher is assigned to the class
        if (req.user.role === 'teacher') {
            const classItem = await Class.getClassById(classId);
            if (!classItem || classItem.teacher_id !== req.user.userId) {
                return res.status(403).json({ error: "Access denied" });
            }
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

// GET ATTENDANCE STATISTICS
export const getStats = async (req, res) => {
    try {
        const { class_id, program_id, timeFrame } = req.query;

        // Check if teacher is assigned to the class if class_id is provided
        if (req.user.role === 'teacher' && class_id) {
            const classItem = await Class.getClassById(class_id);
            if (!classItem || classItem.teacher_id !== req.user.userId) {
                return res.status(403).json({ error: "Access denied" });
            }
        }

        let startDate, endDate = new Date();
        let period = 'daily';

        // Calculate Date Range
        const now = new Date();
        if (timeFrame === 'Today') {
            period = 'daily';
            startDate = new Date(); // Today
        } else if (timeFrame === 'Weekly') {
            period = 'weekly';
            startDate = new Date(now.setMonth(now.getMonth() - 3)); // Last 3 months
        } else if (timeFrame === 'Monthly') {
            period = 'monthly';
            startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // Last 1 year
        } else if (timeFrame === 'Yearly') {
            period = 'yearly';
            startDate = new Date(now.setFullYear(now.getFullYear() - 5)); // Last 5 years
        } else {
            // Default Daily (Last 7 days)
            period = 'daily';
            startDate = new Date(now.setDate(now.getDate() - 6));
        }

        // Format dates for MySQL
        const formatDate = (d) => d.toISOString().split('T')[0];

        const filters = {
            class_id: class_id ? parseInt(class_id) : null,
            program_id: program_id ? parseInt(program_id) : null,
            startDate: formatDate(startDate),
            endDate: formatDate(new Date()), // Today
            period
        };

        const records = await Attendance.getAttendanceStats(filters);
        const totalStudents = await Attendance.getTotalStudents(filters);

        // Transform Data
        const data = records.map(record => {
            const attended = record.attended || 0;
            // Ensure absent is not negative if totalStudents < attended (data inconsistency safety)
            const activeTotal = Math.max(totalStudents, attended);
            const absent = activeTotal - attended;
            const percentage = activeTotal > 0 ? Math.round((attended / activeTotal) * 100) : 0;

            return {
                name: record.label || record.date.toISOString().split('T')[0], // Use label if available (Dayname/Monthname) or Date
                attended,
                absent,
                percentage
            };
        });

        // Fill in missing days/periods if needed? 
        // For simplicity, we just return what we have. Recharts handles gaps okay usually or we might want to fill 0s.
        // The user just wants it to work.

        res.json(data);

    } catch (err) {
        console.error("Get stats error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

import prisma from '../lib/prisma.js';

// SAVE ATTENDANCE
export const saveAttendance = async (req, res) => {
    try {
        const { class_id, date, attendanceData } = req.body;
        if (!class_id || !date || !attendanceData) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const classId = parseInt(class_id);
        const formattedDate = new Date(date);

        // Teacher permission check
        if (req.user.role === 'teacher') {
            const classItem = await prisma.classes.findUnique({ where: { id: classId } });
            if (!classItem || classItem.teacher_id !== parseInt(req.user.userId)) {
                return res.status(403).json({ error: "Access denied" });
            }
        }

        const entries = Object.entries(attendanceData);
        for (const [student_id, status] of entries) {
            if (!student_id || student_id === 'null' || student_id === 'undefined') continue;

            await prisma.attendance.upsert({
                where: {
                    class_id_student_id_date: {
                        class_id: classId,
                        student_id,
                        date: formattedDate
                    }
                },
                update: {
                    hour1: status.hour1 ?? 0,
                    hour2: status.hour2 ?? 0
                },
                create: {
                    class_id: classId,
                    student_id,
                    date: formattedDate,
                    hour1: status.hour1 ?? 0,
                    hour2: status.hour2 ?? 0
                }
            });
        }

        res.json({ message: "Attendance saved successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ATTENDANCE
export const getAttendance = async (req, res) => {
    try {
        const { classId, date } = req.params;
        const formattedDate = new Date(date);

        const records = await prisma.attendance.findMany({
            where: {
                class_id: parseInt(classId),
                date: formattedDate
            }
        });

        const formatted = {};
        records.forEach(r => {
            formatted[r.student_id] = { hour1: r.hour1, hour2: r.hour2 };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ATTENDANCE REPORT (For Teachers)
export const getAttendanceReport = async (req, res) => {
    try {
        const teacherId = parseInt(req.user.userId);
        const { from_date, to_date, class_name, status } = req.query;
        const dateWhere = {};

        if (from_date) {
            const from = new Date(from_date);
            from.setHours(0, 0, 0, 0);
            dateWhere.gte = from;
        }
        if (to_date) {
            const to = new Date(to_date);
            to.setHours(23, 59, 59, 999);
            dateWhere.lte = to;
        }

        const report = await prisma.attendance.findMany({
            where: {
                classes: {
                    teacher_id: teacherId,
                    ...(class_name ? { class_name } : {})
                },
                ...(Object.keys(dateWhere).length ? { date: dateWhere } : {}),
                ...(status === 'Present'
                    ? { OR: [{ hour1: 1 }, { hour2: 1 }] }
                    : status === 'Absent'
                        ? { hour1: 0, hour2: 0 }
                        : {})
            },
            include: {
                students: { select: { full_name: true } },
                classes: { select: { class_name: true } }
            },
            orderBy: { date: 'desc' }
        });

        // Flatten nested relations into flat fields the frontend expects
        const flattened = report.map(r => ({
            id: r.id,
            date: r.date,
            student_id: r.student_id,
            class_id: r.class_id,
            hour1: r.hour1,
            hour2: r.hour2,
            student_name: r.students?.full_name || '-',
            class_name: r.classes?.class_name || '-',
        }));

        res.json(flattened);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET STATS (Simplified)
export const getStats = async (req, res) => {
    try {
        const { class_id, program_id } = req.query;
        const where = {};
        if (class_id) where.class_id = parseInt(class_id);
        
        const attendance = await prisma.attendance.findMany({
            where,
            orderBy: { date: 'asc' }
        });

        // Basic grouping logic for stats
        const stats = attendance.reduce((acc, curr) => {
            const dateStr = curr.date.toISOString().split('T')[0];
            if (!acc[dateStr]) acc[dateStr] = { name: dateStr, attended: 0, absent: 0 };
            
            const isAttended = curr.hour1 === 1 || curr.hour2 === 1;
            if (isAttended) acc[dateStr].attended++;
            else acc[dateStr].absent++;
            
            return acc;
        }, {});

        res.json(Object.values(stats));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET STUDENT ATTENDANCE
export const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const records = await prisma.attendance.findMany({
            where: {
                student_id: studentId
            },
            include: {
                classes: {
                    select: {
                        class_name: true,
                        courses: {
                            select: {
                                course_title: true
                            }
                        },
                        subprograms: {
                            select: {
                                subprogram_name: true,
                                programs: {
                                    select: {
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        // Map it to include course_title, program_name, class_name
        const formattedRecords = records.map(r => ({
            ...r,
            class_name: r.classes?.class_name || "N/A",
            course_title: r.classes?.courses?.course_title || r.classes?.subprograms?.subprogram_name || "N/A",
            program_name: r.classes?.subprograms?.programs?.title || "N/A"
        }));

        res.json({ success: true, records: formattedRecords });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


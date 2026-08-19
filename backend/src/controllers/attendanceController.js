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

// GET STATS (Dynamic Attendance Stats for Admin & Teacher)
export const getStats = async (req, res) => {
    try {
        const { class_id, program_id, timeFrame = 'Weekly' } = req.query;
        const where = {};
        const now = new Date();

        // Scope to teacher's classes if logged-in user is a teacher
        if (req.user && req.user.role === 'teacher') {
            const teacherId = parseInt(req.user.userId || req.user.id);
            const teacherClasses = await prisma.classes.findMany({
                where: { teacher_id: teacherId },
                select: { id: true }
            });
            const teacherClassIds = teacherClasses.map(c => c.id);
            if (class_id) {
                const requestedClassId = parseInt(class_id);
                if (!teacherClassIds.includes(requestedClassId)) {
                    return res.json([]);
                }
                where.class_id = requestedClassId;
            } else {
                where.class_id = { in: teacherClassIds };
            }
        } else {
            // Admin or general query
            if (class_id) {
                where.class_id = parseInt(class_id);
            } else if (program_id) {
                const progId = parseInt(program_id);
                const classesInProg = await prisma.classes.findMany({
                    where: { program_id: progId },
                    select: { id: true }
                });
                where.class_id = { in: classesInProg.map(c => c.id) };
            }
        }

        if (timeFrame === 'Today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            where.date = { gte: today };
        } else if (timeFrame === 'Monthly') {
            const last6Months = new Date(now);
            last6Months.setMonth(now.getMonth() - 5);
            last6Months.setDate(1);
            where.date = { gte: last6Months };
        } else if (timeFrame === 'Yearly') {
            const lastYear = new Date(now);
            lastYear.setFullYear(now.getFullYear() - 1);
            where.date = { gte: lastYear };
        } else {
            // Weekly / Daily: look back 90 days to capture all term cycles & recent sessions
            const lookback = new Date(now);
            lookback.setDate(now.getDate() - 90);
            where.date = { gte: lookback };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            orderBy: { date: 'asc' }
        });

        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const stats = {};

        for (const curr of attendance) {
            const d = new Date(curr.date);
            const dateIso = d.toISOString().split('T')[0];
            const dayName = dayNamesShort[d.getUTCDay() !== undefined ? d.getUTCDay() : d.getDay()];
            let key = dateIso;
            let displayName = `${monthNamesShort[d.getMonth()]} ${d.getDate()}`;

            if (timeFrame === 'Today') {
                displayName = 'Today';
                key = 'Today';
            } else if (timeFrame === 'Daily' || timeFrame === 'Weekly') {
                displayName = `${monthNamesShort[d.getMonth()]} ${d.getDate()}`;
                key = dateIso;
            } else if (timeFrame === 'Monthly') {
                const weekNum = Math.ceil(d.getDate() / 7);
                displayName = `${monthNamesShort[d.getMonth()]} W${weekNum}`;
                key = `${d.getFullYear()}_${d.getMonth()}_w${weekNum}`;
            } else if (timeFrame === 'Yearly') {
                displayName = `${monthNamesShort[d.getMonth()]} ${d.getFullYear()}`;
                key = `${d.getFullYear()}_${d.getMonth()}`;
            }

            if (!stats[key]) {
                stats[key] = {
                    name: displayName,
                    date: dateIso,
                    dayOfWeek: dayName,
                    attended: 0,
                    absent: 0,
                    total: 0,
                    percentage: 0
                };
            }

            const attendedHours = (curr.hour1 === 1 ? 1 : 0) + (curr.hour2 === 1 ? 1 : 0);
            const absentHours = (curr.hour1 === 0 ? 1 : 0) + (curr.hour2 === 0 ? 1 : 0);

            stats[key].attended += attendedHours;
            stats[key].absent += absentHours;
            stats[key].total += (attendedHours + absentHours);
        }

        const result = Object.values(stats).map(item => ({
            ...item,
            percentage: item.total > 0 ? Number(((item.attended / item.total) * 100).toFixed(1)) : 0
        }));

        // Baseline skeleton if empty
        if (result.length === 0) {
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                last7Days.push({
                    name: `${monthNamesShort[d.getMonth()]} ${d.getDate()}`,
                    date: d.toISOString().split('T')[0],
                    dayOfWeek: dayNamesShort[d.getDay()],
                    attended: 0,
                    absent: 0,
                    total: 0,
                    percentage: 0
                });
            }
            return res.json(last7Days);
        }

        res.json(result);
    } catch (err) {
        console.error("getStats error:", err);
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


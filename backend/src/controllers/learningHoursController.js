import prisma from '../lib/prisma.js';

export const getLearningHours = async (req, res) => {
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

        if (timeFrame === 'Daily' || timeFrame === 'Today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            where.date = { gte: today };
        } else if (timeFrame === 'Monthly') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            where.date = { gte: startOfMonth };
        } else if (timeFrame === 'Yearly') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            where.date = { gte: startOfYear };
        } else {
            // Weekly: lookback 90 days to capture active cycle sessions
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
        const grouped = {};

        for (const row of attendance) {
            const d = new Date(row.date);
            const dateIso = d.toISOString().split('T')[0];
            let key = dateIso;
            let displayName = `${monthNamesShort[d.getMonth()]} ${d.getDate()}`;

            if (timeFrame === 'Daily' || timeFrame === 'Today') {
                displayName = 'Today';
                key = 'Today';
            } else if (timeFrame === 'Weekly') {
                // e.g. "Aug 15 (Sat)" or "Aug 15"
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

            if (!grouped[key]) {
                grouped[key] = {
                    name: displayName,
                    date: dateIso,
                    dayOfWeek: dayNamesShort[d.getDay()],
                    hours: 0,
                    students: 0,
                    sessions: 0,
                    _classes: new Set(),
                    _students: new Set()
                };
            }

            const attendedHours = (row.hour1 || 0) + (row.hour2 || 0);
            grouped[key].hours += attendedHours;
            if (row.student_id) grouped[key]._students.add(row.student_id);
            if (row.class_id) grouped[key]._classes.add(`${row.class_id}_${dateIso}`);
        }

        Object.values(grouped).forEach(item => {
            item.students = item._students.size;
            item.sessions = item._classes.size;
            delete item._students;
            delete item._classes;
        });

        let result = Object.values(grouped);

        // Fallback baseline if no records
        if (result.length === 0) {
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                last7Days.push({
                    name: `${monthNamesShort[d.getMonth()]} ${d.getDate()}`,
                    date: d.toISOString().split('T')[0],
                    dayOfWeek: dayNamesShort[d.getDay()],
                    hours: 0,
                    students: 0,
                    sessions: 0
                });
            }
            result = last7Days;
        }

        res.json(result);
    } catch (err) {
        console.error("getLearningHours error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getLearningHoursSummary = async (req, res) => {
    try {
        const { class_id, program_id, student_id } = req.query;

        const where = {};
        if (class_id) where.class_id = parseInt(class_id);
        if (student_id) where.student_id = student_id;
        if (program_id) {
            const progId = parseInt(program_id);
            const classesInProg = await prisma.classes.findMany({
                where: { program_id: progId },
                select: { id: true }
            });
            where.class_id = { in: classesInProg.map(c => c.id) };
        }

        const rows = await prisma.attendance.findMany({ where });

        let totalHours = 0;
        let uniqueStudents = new Set();
        let uniqueSessions = new Set();

        for (const r of rows) {
            const hours = (r.hour1 || 0) + (r.hour2 || 0);
            if (hours > 0) {
                totalHours += hours;
                if (r.student_id) uniqueStudents.add(r.student_id);
                if (r.class_id && r.date) {
                    uniqueSessions.add(`${r.class_id}_${r.date.toISOString().split('T')[0]}`);
                }
            }
        }

        res.json({
            total_sessions: uniqueSessions.size,
            total_hours: totalHours,
            unique_students: uniqueStudents.size
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

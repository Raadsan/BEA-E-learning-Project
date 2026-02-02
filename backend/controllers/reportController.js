import db from "../database/dbconfig.js";

const dbp = db.promise();

// 1. GET Overall Student Stats (Combined)
export const getStudentStats = async (req, res) => {
    try {
        const { program, class_id } = req.query;

        // Helper to build WHERE conditions
        const getCond = (table) => {
            let clauses = [];
            let params = [];
            // ProficiencyTestStudents doesn't have chosen_program column, so if program is 'Proficiency Test' we match all of them, else none?
            // Or better: The frontend sends 'Proficiency Test' as program.
            // If table is ProficiencyTestStudents:
            //   if program == 'Proficiency Test' -> 1=1
            //   if program != 'Proficiency Test' and program is set -> 1=0 (exclude)
            //   if program is not set -> include

            if (table === 'ProficiencyTestStudents') {
                if (program) {
                    if (program === 'Proficiency Test') {
                        // Match all
                    } else {
                        // Exclude
                        clauses.push("1=0");
                    }
                }
                // class_id is irrelevant for this table usually? Assuming they don't have classes yet or strict one-to-one
                if (class_id) { clauses.push("1=0"); } // Assuming they don't have class_id? Or check schema. Model doesn't show class_id.
            } else {
                if (program) { clauses.push("chosen_program = ?"); params.push(program); }
                if (class_id) { clauses.push("class_id = ?"); params.push(class_id); }
            }
            return { w: clauses.length ? " WHERE " + clauses.join(" AND ") : "", p: params };
        };

        const sC = getCond('students');
        const iC = getCond('IELTSTOEFL');
        const pC = getCond('ProficiencyTestStudents');

        const [totalStd] = await dbp.query(`
            SELECT (SELECT COUNT(*) FROM students ${sC.w}) + 
                   (SELECT COUNT(*) FROM IELTSTOEFL ${iC.w}) + 
                   (SELECT COUNT(*) FROM ProficiencyTestStudents ${pC.w}) as count
        `, [...sC.p, ...iC.p, ...pC.p]);

        const [pendingStd] = await dbp.query(`
            SELECT 
                (SELECT COUNT(*) FROM students WHERE approval_status = 'pending' ${sC.w ? 'AND ' + sC.w.substring(7) : ''}) + 
                (SELECT COUNT(*) FROM IELTSTOEFL WHERE status = 'Pending' ${iC.w ? 'AND ' + iC.w.substring(7) : ''}) + 
                (SELECT COUNT(*) FROM ProficiencyTestStudents WHERE status = 'Pending' ${pC.w ? 'AND ' + pC.w.substring(7) : ''}) as count
        `, [...sC.p, ...iC.p, ...pC.p]);

        const [assignedStd] = await dbp.query(`
            SELECT 
                (SELECT COUNT(*) FROM students WHERE class_id IS NOT NULL ${sC.w ? 'AND ' + sC.w.substring(7) : ''}) + 
                (SELECT COUNT(*) FROM IELTSTOEFL WHERE class_id IS NOT NULL ${iC.w ? 'AND ' + iC.w.substring(7) : ''}) as count
        `, [...sC.p, ...iC.p]);

        // For counts like programs/classes, simplistic filtering or keeping global if no filter
        // If program is selected, we could query specific classes. For now, keeping global if no filter.
        let totalProgsCount = 0;
        let totalClassesCount = 0;

        if (program) {
            const [tp] = await dbp.query("SELECT COUNT(*) as count FROM programs WHERE title = ?", [program]);
            totalProgsCount = tp[0].count;
            // Classes for a program: complex join programs -> subprograms -> classes
            // We'll skip complex class counting for now or do a simpler query if needed.
            // Just keeping it simple:
            const [tc] = await dbp.query(`
                SELECT COUNT(*) as count FROM classes c 
                JOIN subprograms sp ON c.subprogram_id = sp.id
                JOIN programs p ON sp.program_id = p.id
                WHERE p.title = ?
             `, [program]);
            totalClassesCount = tc[0].count;
        } else {
            const [tp] = await dbp.query("SELECT COUNT(*) as count FROM programs");
            totalProgsCount = tp[0].count;
            const [tc] = await dbp.query("SELECT COUNT(*) as count FROM classes");
            totalClassesCount = tc[0].count;
        }

        // High Performers (Needs join to students to valid filters)
        // This is expensive: SUB-SELECT with JOIN
        const hpQuery = `
            SELECT COUNT(*) as count FROM (
                SELECT sub.student_id FROM assignment_submissions sub
                JOIN (
                    SELECT student_id, chosen_program, class_id FROM students
                    UNION ALL
                    SELECT student_id, chosen_program, class_id FROM IELTSTOEFL
                ) s ON sub.student_id = s.student_id
                WHERE sub.status = 'graded' 
                ${program ? 'AND s.chosen_program = ?' : ''}
                ${class_id ? 'AND s.class_id = ?' : ''}
                GROUP BY sub.student_id 
                HAVING AVG(sub.score) >= 80
            ) as performers
        `;
        const hpParams = [];
        if (program) hpParams.push(program);
        if (class_id) hpParams.push(class_id);
        const [highPerf] = await dbp.query(hpQuery, hpParams);

        // Avg Score
        const avgQuery = `
            SELECT AVG(sub.score) as avg FROM assignment_submissions sub
            JOIN (
                SELECT student_id, chosen_program, class_id FROM students
                UNION ALL
                SELECT student_id, chosen_program, class_id FROM IELTSTOEFL
            ) s ON sub.student_id = s.student_id
            WHERE sub.status = 'graded'
            ${program ? 'AND s.chosen_program = ?' : ''}
            ${class_id ? 'AND s.class_id = ?' : ''}
        `;
        const avgParams = [...hpParams];
        const [avgScr] = await dbp.query(avgQuery, avgParams);

        // Last Week
        const [lastWk] = await dbp.query(`
            SELECT 
                (SELECT COUNT(*) FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${sC.w ? 'AND ' + sC.w.substring(7) : ''}) + 
                (SELECT COUNT(*) FROM IELTSTOEFL WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${iC.w ? 'AND ' + iC.w.substring(7) : ''}) + 
                (SELECT COUNT(*) FROM ProficiencyTestStudents WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${pC.w ? 'AND ' + pC.w.substring(7) : ''}) as count
        `, [...sC.p, ...iC.p, ...pC.p]);

        res.json({
            success: true,
            data: {
                totalStudents: totalStd[0].count,
                pendingStudents: pendingStd[0].count,
                assignedToClass: assignedStd[0].count,
                totalPrograms: totalProgsCount,
                totalClasses: totalClassesCount,
                highPerformers: highPerf[0].count,
                overallAverageScore: Math.round(avgScr[0].avg || 0),
                lastWeekRegistrations: lastWk[0].count
            }
        });
    } catch (error) {
        console.error("Error in getStudentStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. GET Program Distribution (Combined or Drill-down)
export const getProgramDistribution = async (req, res) => {
    try {
        const { program } = req.query;

        // If a specific program is selected, we drill down into its SUBPROGRAMS
        if (program && program !== 'Proficiency Test') {
            const [rows] = await dbp.query(`
                SELECT sp.subprogram_name as name, COUNT(s.student_id) as students
                FROM students s
                JOIN subprograms sp ON s.chosen_subprogram = sp.id
                WHERE s.chosen_program = ?
                GROUP BY sp.subprogram_name
                ORDER BY students DESC
            `, [program]);
            return res.json({ success: true, data: rows });
        }

        // If 'Proficiency Test' is selected (no subprograms), just return the single bar
        if (program === 'Proficiency Test') {
            const [rows] = await dbp.query(`
                SELECT 'Proficiency Test' as name, COUNT(*) as students
                FROM ProficiencyTestStudents
            `);
            return res.json({ success: true, data: rows });
        }

        // Default: Show distribution of ALL PROGRAMS (High Level)
        const [rows] = await dbp.query(`
            SELECT name, SUM(students) as students FROM (
                SELECT chosen_program as name, COUNT(*) as students 
                FROM students 
                GROUP BY chosen_program 
                UNION ALL
                SELECT chosen_program as name, COUNT(*) as students 
                FROM IELTSTOEFL 
                GROUP BY chosen_program 
                UNION ALL
                SELECT 'Proficiency Test' as name, COUNT(*) as students
                FROM ProficiencyTestStudents
            ) combined
            GROUP BY name
            ORDER BY students DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getProgramDistribution:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. GET Subprogram Distribution (Combined)
export const getSubprogramDistribution = async (req, res) => {
    try {
        const [rows] = await dbp.query(`
            SELECT sp.subprogram_name as name, COUNT(*) as students 
            FROM students s
            JOIN subprograms sp ON s.chosen_subprogram = sp.id
            GROUP BY sp.subprogram_name
            ORDER BY students DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getSubprogramDistribution:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. GET Performance Overview
export const getPerformanceOverview = async (req, res) => {
    try {
        const [performanceRows] = await dbp.query(`
            SELECT 
                SUM(CASE WHEN avg_score >= 80 THEN 1 ELSE 0 END) as excellent_count,
                SUM(CASE WHEN avg_score < 80 THEN 1 ELSE 0 END) as below_80_count
            FROM (
                SELECT AVG(score) as avg_score 
                FROM assignment_submissions 
                WHERE status = 'graded' 
                GROUP BY student_id
            ) as student_avgs
        `);

        res.json({
            success: true,
            data: {
                excellent_count: performanceRows[0].excellent_count || 0,
                below_80_count: performanceRows[0].below_80_count || 0
            }
        });
    } catch (error) {
        console.error("Error in getPerformanceOverview:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. GET Detailed Student List with Analytics (Unified)
export const getDetailedStudentList = async (req, res) => {
    try {
        const { program, class_id, subprogram_id, search, limit = 100, offset = 0, sort_by = 'registration_date', order = 'desc' } = req.query;

        // Base query for regular students
        const stdBase = `
            SELECT 
                s.student_id, s.full_name, s.email, s.phone, s.sex, s.age, 
                s.residency_country, s.residency_city, s.chosen_program, 
                sp.subprogram_name, c.class_name, s.approval_status as status,
                s.created_at as registration_date,
                COALESCE(att.rate, 0) as attendance_rate,
                COALESCE(perf.avg_score, 0) as overall_average
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN subprograms sp ON s.chosen_subprogram = sp.id
            LEFT JOIN (SELECT student_id, ROUND((SUM(hour1+hour2)/(COUNT(*)*2))*100,2) as rate FROM attendance GROUP BY student_id) att ON s.student_id = att.student_id
            LEFT JOIN (SELECT student_id, ROUND(AVG(score), 2) as avg_score FROM assignment_submissions WHERE status='graded' GROUP BY student_id) perf ON s.student_id = perf.student_id
        `;

        // Base query for IELTSTOEFL students
        const ieltsBase = `
            SELECT 
                i.student_id, CONCAT(i.first_name, ' ', i.last_name) as full_name, i.email, i.phone, i.sex, i.age, 
                i.residency_country, i.residency_city, i.chosen_program, 
                NULL as subprogram_name, c.class_name, i.status,
                i.registration_date,
                COALESCE(att.rate, 0) as attendance_rate,
                COALESCE(perf.avg_score, 0) as overall_average
            FROM IELTSTOEFL i
            LEFT JOIN classes c ON i.class_id = c.id
            LEFT JOIN (SELECT student_id, ROUND((SUM(hour1+hour2)/(COUNT(*)*2))*100,2) as rate FROM attendance GROUP BY student_id) att ON i.student_id = att.student_id
            LEFT JOIN (SELECT student_id, ROUND(AVG(score), 2) as avg_score FROM assignment_submissions WHERE status='graded' GROUP BY student_id) perf ON i.student_id = perf.student_id
        `;

        // Base query for ProficiencyTestStudents
        const profBase = `
            SELECT 
                p.student_id, CONCAT(p.first_name, ' ', p.last_name) as full_name, p.email, p.phone, p.sex, p.age,
                p.residency_country, p.residency_city, 'Proficiency Test' as chosen_program,
                NULL as subprogram_name, NULL as class_name, p.status,
                p.registration_date,
                0 as attendance_rate,
                0 as overall_average
            FROM ProficiencyTestStudents p
        `;

        const buildConditions = (tablePrefix) => {
            const conds = [];
            const pms = [];
            if (tablePrefix === 'p') {
                if (program && program !== 'Proficiency Test') conds.push("1=0");
                if (class_id) conds.push("1=0"); // No classes for proficiency only
                if (search) {
                    conds.push(`(CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR p.email LIKE ? OR p.student_id LIKE ?)`);
                    pms.push(`%${search}%`, `%${search}%`, `%${search}%`);
                }
            } else {
                if (program) { conds.push(`${tablePrefix}.chosen_program = ?`); pms.push(program); }
                if (class_id) { conds.push(`${tablePrefix}.class_id = ?`); pms.push(class_id); }
                if (subprogram_id && tablePrefix === 's') { conds.push(`${tablePrefix}.chosen_subprogram = ?`); pms.push(subprogram_id); }
                if (search) {
                    if (tablePrefix === 's') conds.push(`(s.full_name LIKE ? OR s.email LIKE ? OR s.student_id LIKE ?)`);
                    else conds.push(`(CONCAT(i.first_name, ' ', i.last_name) LIKE ? OR i.email LIKE ? OR i.student_id LIKE ?)`);
                    pms.push(`%${search}%`, `%${search}%`, `%${search}%`);
                }
            }
            return { where: conds.length ? " WHERE " + conds.join(" AND ") : "", pms };
        };

        const stdCond = buildConditions('s');
        const ieltsCond = buildConditions('i');
        const profCond = buildConditions('p');

        const unionQuery = `
            SELECT * FROM (
                ${stdBase} ${stdCond.where} 
                UNION ALL 
                ${ieltsBase} ${ieltsCond.where}
                UNION ALL
                ${profBase} ${profCond.where}
            ) unified
            ORDER BY ${sort_by === 'full_name' ? 'full_name' : 'registration_date'} ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
            LIMIT ? OFFSET ?
        `;

        const allParams = [...stdCond.pms, ...ieltsCond.pms, ...profCond.pms, parseInt(limit), parseInt(offset)];
        const [students] = await dbp.query(unionQuery, allParams);

        // Count query
        const countQuery = `
            SELECT (SELECT COUNT(*) FROM students s ${stdCond.where}) + 
                   (SELECT COUNT(*) FROM IELTSTOEFL i ${ieltsCond.where}) + 
                   (SELECT COUNT(*) FROM ProficiencyTestStudents p ${profCond.where}) as total
        `;
        const [countResult] = await dbp.query(countQuery, [...stdCond.pms, ...ieltsCond.pms, ...profCond.pms]);

        res.json({
            success: true,
            data: {
                students,
                total: countResult[0].total
            }
        });
    } catch (error) {
        console.error("Error in getDetailedStudentList:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. GET Student Detailed Report
export const getStudentDetailedReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        let [studentRows] = await dbp.query(`
            SELECT s.*, c.class_name 
            FROM students s 
            LEFT JOIN classes c ON s.class_id = c.id 
            WHERE s.student_id = ?
        `, [studentId]);

        if (!studentRows[0]) {
            [studentRows] = await dbp.query(`
                SELECT i.*, c.class_name, CONCAT(i.first_name, ' ', i.last_name) as full_name
                FROM IELTSTOEFL i 
                LEFT JOIN classes c ON i.class_id = c.id 
                WHERE i.student_id = ?
            `, [studentId]);
        }

        if (!studentRows[0]) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const [attendance] = await dbp.query("SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC", [studentId]);
        const [submissions] = await dbp.query("SELECT * FROM assignment_submissions WHERE student_id = ? ORDER BY created_at DESC", [studentId]);

        res.json({
            success: true,
            data: {
                student: studentRows[0],
                attendance,
                submissions
            }
        });
    } catch (error) {
        console.error("Error in getStudentDetailedReport:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. GET Attendance Analytics
export const getAttendanceAnalytics = async (req, res) => {
    try {
        const { program, class_id, date_from, date_to } = req.query;
        let query = `
            SELECT date, AVG(hour1 + hour2) / 2 * 100 as avg_attendance
            FROM attendance a
            INNER JOIN (
                SELECT student_id, chosen_program FROM students
                UNION ALL
                SELECT student_id, chosen_program FROM IELTSTOEFL
            ) s ON a.student_id = s.student_id
            WHERE 1=1
        `;
        const params = [];

        if (program) { query += " AND s.chosen_program = ?"; params.push(program); }
        if (class_id) { query += " AND a.class_id = ?"; params.push(class_id); }
        if (date_from) { query += " AND a.date >= ?"; params.push(date_from); }
        if (date_to) { query += " AND a.date <= ?"; params.push(date_to); }

        query += " GROUP BY date ORDER BY date ASC";
        const [rows] = await dbp.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getAttendanceAnalytics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. GET Assignment Completion Analytics
export const getAssignmentCompletionAnalytics = async (req, res) => {
    try {
        const { program, class_id } = req.query;
        let query = `
            SELECT status, COUNT(*) as count 
            FROM assignment_submissions sub
            INNER JOIN (
                SELECT student_id, chosen_program, class_id FROM students
                UNION ALL
                SELECT student_id, chosen_program, class_id FROM IELTSTOEFL
            ) s ON sub.student_id = s.student_id
            WHERE 1=1
        `;
        const params = [];
        if (program) { query += " AND s.chosen_program = ?"; params.push(program); }
        if (class_id) { query += " AND s.class_id = ?"; params.push(class_id); }

        query += " GROUP BY status";
        const [rows] = await dbp.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getAssignmentCompletionAnalytics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. GET Consolidated Stats
export const getConsolidatedStats = async (req, res) => {
    try {
        const { program, class_id } = req.query;

        const getW = (table) => {
            let clauses = [];
            let params = [];
            if (table === 'ProficiencyTestStudents') {
                if (program && program !== 'Proficiency Test') clauses.push("1=0");
                if (class_id) clauses.push("1=0");
            } else {
                if (program) { clauses.push("chosen_program = ?"); params.push(program); }
                if (class_id) { clauses.push("class_id = ?"); params.push(class_id); }
            }
            return { sql: clauses.length ? "WHERE " + clauses.join(" AND ") : "", params };
        };
        const s = getW('students');
        const i = getW('IELTSTOEFL');
        const p = getW('ProficiencyTestStudents');

        const [gender] = await dbp.query(`
            SELECT sex as name, SUM(val) as value FROM (
                SELECT sex, COUNT(*) as val FROM students ${s.sql} GROUP BY sex
                UNION ALL
                SELECT sex, COUNT(*) as val FROM IELTSTOEFL ${i.sql} GROUP BY sex
                UNION ALL
                SELECT sex, COUNT(*) as val FROM ProficiencyTestStudents ${p.sql} GROUP BY sex
            ) g GROUP BY sex
        `, [...s.params, ...i.params, ...p.params]);

        const [status] = await dbp.query(`
            SELECT status as name, SUM(val) as value FROM (
                SELECT approval_status as status, COUNT(*) as val FROM students ${s.sql} GROUP BY approval_status
                UNION ALL
                SELECT status, COUNT(*) as val FROM IELTSTOEFL ${i.sql} GROUP BY status
                UNION ALL
                SELECT status, COUNT(*) as val FROM ProficiencyTestStudents ${p.sql} GROUP BY status
            ) s GROUP BY status
        `, [...s.params, ...i.params, ...p.params]);

        const [enrollment] = await dbp.query(`
            SELECT month, SUM(students) as students, MIN(created_at) as sort_date FROM (
                SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as students, created_at FROM students
                ${s.sql ? s.sql + ' AND' : 'WHERE'} created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month
                UNION ALL
                SELECT DATE_FORMAT(registration_date, '%b %Y') as month, COUNT(*) as students, registration_date FROM IELTSTOEFL
                ${i.sql ? i.sql + ' AND' : 'WHERE'} registration_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month
                UNION ALL
                SELECT DATE_FORMAT(registration_date, '%b %Y') as month, COUNT(*) as students, registration_date FROM ProficiencyTestStudents
                ${p.sql ? p.sql + ' AND' : 'WHERE'} registration_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month
            ) e GROUP BY month ORDER BY sort_date ASC
        `, [...s.params, ...i.params, ...p.params]);

        res.json({
            success: true,
            data: {
                gender: gender.map(g => ({ name: g.name || 'Unknown', value: parseInt(g.value) })),
                status: status.map(s => ({ name: s.name ? s.name.charAt(0).toUpperCase() + s.name.slice(1) : 'Unknown', value: parseInt(s.value) })),
                enrollment: enrollment.map(e => ({ month: e.month, students: parseInt(e.students) }))
            }
        });
    } catch (error) {
        console.error("Error in getConsolidatedStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. GET Assessment Stats
export const getAssessmentStats = async (req, res) => {
    try {
        const { program, class_id } = req.query;

        // 1. Total Assessments (Assignments + Tests + Placement + Proficiency)
        let assignmentWhere = "";
        let assignmentParams = [];

        // Placement and Proficiency tests are usually global or system-wide, not linked to a specific program/class structure directly in the same way
        // But let's respect filters where possible for Assignments.

        if (program) {
            assignmentWhere = `
                JOIN classes c ON a.class_id = c.id
                JOIN subprograms sp ON c.subprogram_id = sp.id
                JOIN programs p ON sp.program_id = p.id
                WHERE p.title = ?
            `;
            assignmentParams.push(program);
        } else if (class_id) {
            assignmentWhere = "WHERE class_id = ?";
            assignmentParams.push(class_id);
        }

        const [totalAssigns] = await dbp.query(`SELECT COUNT(*) as count FROM assignments a ${assignmentWhere}`, assignmentParams);

        // For Placement/Proficiency, we usually count them all if no filters, or maybe valid to show them always as they are available to everyone
        // But if filtering by Program, maybe Proficiency applies if matched?
        // Let's just count global for these tests if no class filter.

        let totalPlacement = 0;
        let totalProficiency = 0;

        if (!class_id) {
            const [tp] = await dbp.query("SELECT COUNT(*) as count FROM placement_tests");
            totalPlacement = tp[0].count;
            const [tprof] = await dbp.query("SELECT COUNT(*) as count FROM proficiency_tests");
            totalProficiency = tprof[0].count;
        }

        const totalAssessments = totalAssigns[0].count + totalPlacement + totalProficiency;

        // 2. Submissions Stats (Count, Avg Score, Pass Rate)
        // We need to UNION all submission tables and then apply filters

        // Assignments
        let subWhere = "WHERE sub.status = 'graded'";
        let subParams = [];
        if (program) {
            subWhere += ` AND (s.chosen_program = ? OR i.chosen_program = ? OR (CASE WHEN p.student_id IS NOT NULL THEN 'Proficiency Test' END) = ?)`;
            subParams.push(program, program, program);
        }
        if (class_id) {
            subWhere += " AND (s.class_id = ? OR i.class_id = ?)";
            subParams.push(class_id, class_id);
        }

        const assignQuery = `
            SELECT sub.score, sub.status 
            FROM assignment_submissions sub
            LEFT JOIN students s ON sub.student_id = s.student_id
            LEFT JOIN IELTSTOEFL i ON sub.student_id = i.student_id
            LEFT JOIN ProficiencyTestStudents p ON sub.student_id = p.student_id
            ${subWhere}
        `;

        // Placement Results
        // Filtering by Program/Class is tricky for Placement. Students usually take it BEFORE being assigned.
        // But we can check current student status.
        let placeWhere = "WHERE r.status = 'completed'";
        let placeParams = [];
        if (program) {
            placeWhere += ` AND (s.chosen_program = ? OR i.chosen_program = ? OR (CASE WHEN p.student_id IS NOT NULL THEN 'Proficiency Test' END) = ?)`;
            placeParams.push(program, program, program);
        }
        if (class_id) {
            placeWhere += " AND (s.class_id = ? OR i.class_id = ?)";
            placeParams.push(class_id, class_id);
        }

        const placeQuery = `
            SELECT r.score, r.status
            FROM placement_test_results r
            LEFT JOIN students s ON r.student_id = s.student_id
            LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
            LEFT JOIN ProficiencyTestStudents p ON r.student_id = p.student_id
            ${placeWhere}
        `;

        // Proficiency Results
        const profQuery = `
            SELECT r.score, r.status
            FROM proficiency_test_results r
            LEFT JOIN students s ON r.student_id = s.student_id
            LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
            LEFT JOIN ProficiencyTestStudents p ON r.student_id = p.student_id
            ${placeWhere}
        `; // Re-using placeWhere/Params as logic is same

        // Combine
        const [allSubs] = await dbp.query(`
            SELECT score, status FROM (${assignQuery} UNION ALL ${placeQuery} UNION ALL ${profQuery}) as united
        `, [...subParams, ...placeParams, ...placeParams]);

        const totalSubs = allSubs.length;
        const totalScore = allSubs.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const avgScore = totalSubs > 0 ? Math.round(totalScore / totalSubs) : 0; // Scores might need normalization if out of different totals? 
        // Assuming all are normalized to 0-100 or using percentages. 
        // Wait, assignment scores are raw points. Placement/Proficiency might be raw.
        // We SHOULD use percentage if available.
        // Let we adjust queries to fetch percentage if possible, else raw.
        // Assignment Logic: Score is points. We need total_points to get percentage.
        // Re-writing queries to fetch percentage.

        // Simplified approach: Just assume score is what we track for now, or fetch percentage if stored.
        // Placement/Proficiency store percentage. Assignment submissions do NOT store percentage directly usually.
        // Let's rely on 'score' for now, assuming standard 100 for exams, or mix. 
        // For generic stats, this might be rough.

        const passedCount = allSubs.filter(s => s.score >= 50).length; // Assuming 50 is pass
        const passRate = totalSubs > 0 ? Math.round((passedCount / totalSubs) * 100) : 0;

        // 3. Pending Grading
        // Assignments: submitted
        const [pendAssign] = await dbp.query("SELECT COUNT(*) as count FROM assignment_submissions WHERE status = 'submitted'");
        // Placement: pending_review
        const [pendPlace] = await dbp.query("SELECT COUNT(*) as count FROM placement_test_results WHERE status = 'pending_review'");
        // Proficiency: pending
        const [pendProf] = await dbp.query("SELECT COUNT(*) as count FROM proficiency_test_results WHERE status = 'pending'");

        const totalPending = pendAssign[0].count + pendPlace[0].count + pendProf[0].count;

        res.json({
            success: true,
            data: {
                totalAssessments: totalAssessments,
                totalSubmissions: totalSubs,
                avgScore,
                passRate,
                pendingGrading: totalPending
            }
        });
    } catch (error) {
        console.error("Error in getAssessmentStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 11. GET Assessment Distribution (Scores)
export const getAssessmentDistribution = async (req, res) => {
    try {
        const { program } = req.query;
        let where = "WHERE sub.status = 'graded'";
        let params = [];
        let rWhere = "WHERE r.status = 'completed'";
        let rParams = [];

        if (program) {
            where += ` AND (s.chosen_program = ? OR i.chosen_program = ?)`;
            params.push(program, program);

            rWhere += ` AND (s.chosen_program = ? OR i.chosen_program = ?)`;
            rParams.push(program, program);
        }

        /* 
           We need to union percentages.
           Assignments: Need to calculate percentage dynamically via JOIN assignments a -> (score / a.total_marks * 100)
           Placement: percentage column
           Proficiency: percentage column
        */

        const [rows] = await dbp.query(`
            SELECT 
                type,
                CASE 
                    WHEN pct BETWEEN 0 AND 20 THEN '0-20'
                    WHEN pct BETWEEN 21 AND 40 THEN '21-40'
                    WHEN pct BETWEEN 41 AND 60 THEN '41-60'
                    WHEN pct BETWEEN 61 AND 80 THEN '61-80'
                    ELSE '81-100'
                END as range_name,
                COUNT(*) as count
            FROM (
                SELECT 'Assignment' as type, (sub.score) as pct 
                FROM assignment_submissions sub
                LEFT JOIN students s ON sub.student_id = s.student_id
                LEFT JOIN IELTSTOEFL i ON sub.student_id = i.student_id
                ${where}
                
                UNION ALL
                
                SELECT 'Placement Test' as type, r.percentage as pct
                FROM placement_test_results r
                LEFT JOIN students s ON r.student_id = s.student_id
                LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
                ${rWhere}
                
                UNION ALL
                
                SELECT 'Proficiency Test' as type, (CASE WHEN r.total_points > 0 THEN (r.score / r.total_points) * 100 ELSE 0 END) as pct
                FROM proficiency_test_results r
                LEFT JOIN students s ON r.student_id = s.student_id
                LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
                ${rWhere}
            ) as unified
            GROUP BY type, range_name
            ORDER BY range_name
        `, [...params, ...rParams, ...rParams]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getAssessmentDistribution:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 12. GET Recent Assessments
export const getRecentAssessments = async (req, res) => {
    try {
        // Union Assignments, Placement Tests, Proficiency Tests
        /*
          Cols needed: title, type, class_name (if applicable), date (created_at), average_score
        */
        const [rows] = await dbp.query(`
            SELECT title, type, class_name, due_date, submissions, avg_score
            FROM (
                -- Assignments
                SELECT a.title, 'Assignment' as type, c.class_name, a.created_at as due_date,
                       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submissions,
                       (SELECT AVG(score) FROM assignment_submissions WHERE assignment_id = a.id AND status = 'graded') as avg_score
                FROM assignments a
                LEFT JOIN classes c ON a.class_id = c.id
                
                UNION ALL
                
                -- Placement Tests
                SELECT title, 'Placement Test' as type, 'N/A' as class_name, created_at as due_date,
                       (SELECT COUNT(*) FROM placement_test_results WHERE test_id = t.id) as submissions,
                       (SELECT AVG(score) FROM placement_test_results WHERE test_id = t.id AND status = 'completed') as avg_score
                FROM placement_tests t
                
                UNION ALL
                 -- Proficiency Tests
                SELECT title, 'Proficiency Test' as type, 'N/A' as class_name, created_at as due_date,
                       (SELECT COUNT(*) FROM proficiency_test_results WHERE test_id = t.id) as submissions,
                       (SELECT AVG(score) FROM proficiency_test_results WHERE test_id = t.id AND status = 'graded') as avg_score
                FROM proficiency_tests t
            ) as unified
            ORDER BY due_date DESC
            LIMIT 15
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getRecentAssessments:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 13. GET Assessment Gender Stats
export const getAssessmentGenderStats = async (req, res) => {
    try {
        const { program } = req.query;
        let where = "";
        let params = [];

        // If filtering by program, we filter the students
        if (program) {
            // If program is 'Proficiency Test', we include those from ProficiencyTestStudents table (p)
            // matching logic: (s.program = ? OR i.program = ?) OR (program == 'Proficiency Test' AND p.id IS NOT NULL)
            where = " AND (s.chosen_program = ? OR i.chosen_program = ? OR (? = 'Proficiency Test' AND p.student_id IS NOT NULL))";
            params.push(program, program, program);
        }

        /* 
           Placement Gender Stats
           Join results -> students/ielts/proficiency -> sex
        */
        const [placementGender] = await dbp.query(`
            SELECT 
                COALESCE(s.sex, i.sex, p.sex, 'Unknown') as gender, 
                COUNT(*) as count
            FROM placement_test_results r
            LEFT JOIN students s ON r.student_id = s.student_id
            LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
            LEFT JOIN ProficiencyTestStudents p ON r.student_id = p.student_id
            WHERE r.status IN ('completed', 'pending_review', 'reviewed', 'graded') ${where}
            GROUP BY gender
        `, params);

        /* 
          Proficiency Gender Stats
          Updated to include 'pending_review', 'reviewed' to match "entered" users
       */
        const [proficiencyGender] = await dbp.query(`
            SELECT 
                COALESCE(s.sex, i.sex, p.sex, 'Unknown') as gender, 
                COUNT(*) as count
            FROM proficiency_test_results r
            LEFT JOIN students s ON r.student_id = s.student_id
            LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
            LEFT JOIN ProficiencyTestStudents p ON r.student_id = p.student_id
            WHERE r.status IN ('graded', 'completed', 'pending_review', 'reviewed', 'pending') ${where}
            GROUP BY gender
        `, params);

        const formatGenderData = (rows) => {
            let male = 0;
            let female = 0;
            let unknown = 0;
            rows.forEach(r => {
                const g = (r.gender || 'Unknown').toLowerCase();
                if (g === 'male' || g === 'm') male += r.count;
                else if (g === 'female' || g === 'f') female += r.count;
                else unknown += r.count;
            });
            return { male, female, unknown };
        };

        res.json({
            success: true,
            data: {
                placement: formatGenderData(placementGender),
                proficiency: formatGenderData(proficiencyGender)
            }
        });

    } catch (error) {
        console.error("Error in getAssessmentGenderStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 14. GET Class Assessment Activity
export const getClassAssessmentActivity = async (req, res) => {
    try {
        const { program } = req.query;
        let where = "";
        let params = [];

        if (program) {
            where = `
                JOIN subprograms sp ON c.subprogram_id = sp.id
                JOIN programs p ON sp.program_id = p.id
                WHERE p.title = ?
            `;
            params.push(program);
        }

        const [rows] = await dbp.query(`
            SELECT c.class_name, COUNT(a.id) as count
            FROM classes c
            LEFT JOIN assignments a ON c.id = a.class_id
            ${where}
            GROUP BY c.id
            HAVING count > 0
            ORDER BY count DESC
            LIMIT 10
        `, params);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error in getClassAssessmentActivity:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

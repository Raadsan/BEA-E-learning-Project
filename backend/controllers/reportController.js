import db from "../database/dbconfig.js";

const dbp = db.promise();

// GET STUDENT STATISTICS (Summary Boxes)
export const getStudentStats = async (req, res) => {
  try {
    // 1. Total Students
    const [totalStudents] = await dbp.query(`
      SELECT 
        (SELECT COUNT(*) FROM students) + 
        (SELECT COUNT(*) FROM IELTSTOEFL) as total
    `);

    // 2. Total Programs
    const [totalPrograms] = await dbp.query("SELECT COUNT(*) as total FROM programs");

    // 3. Highest Program (by enrollment)
    const [highestProgram] = await dbp.query(`
      SELECT program_name, COUNT(*) as count 
      FROM (
        SELECT chosen_program as program_name FROM students
        UNION ALL
        SELECT exam_type as program_name FROM IELTSTOEFL
      ) combined
      GROUP BY program_name 
      ORDER BY count DESC 
      LIMIT 1
    `);

    // 4. Last Week Registrations
    const [lastWeek] = await dbp.query(`
      SELECT COUNT(*) as total 
      FROM (
        SELECT created_at as registration_date FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT registration_date FROM IELTSTOEFL WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ) combined
    `);

    res.json({
      success: true,
      data: {
        totalStudents: totalStudents[0].total,
        totalPrograms: totalPrograms[0].total,
        highestProgram: highestProgram[0]?.program_name || 'N/A',
        lastWeekRegistrations: lastWeek[0].total
      }
    });
  } catch (err) {
    console.error("❌ Stats Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET PROGRAM DISTRIBUTION (Bar Chart 1)
export const getProgramDistribution = async (req, res) => {
  try {
    const [distribution] = await dbp.query(`
      SELECT program_name as name, COUNT(*) as students 
      FROM (
        SELECT chosen_program as program_name FROM students
        UNION ALL
        SELECT exam_type as program_name FROM IELTSTOEFL
      ) combined
      WHERE program_name IS NOT NULL
      GROUP BY program_name 
      ORDER BY students DESC 
    `);

    res.json({ success: true, data: distribution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET SUBPROGRAM/LEVEL DISTRIBUTION (Bar Chart 2)
export const getSubprogramDistribution = async (req, res) => {
  try {
    const [distribution] = await dbp.query(`
      SELECT name, COUNT(*) as students 
      FROM (
        SELECT CONCAT(chosen_program, ' - ', IFNULL(chosen_subprogram, 'General')) as name FROM students
        UNION ALL
        SELECT CONCAT(exam_type, ' - ', 'Proficiency') as name FROM IELTSTOEFL
      ) combined
      GROUP BY name 
      ORDER BY students DESC 
    `);

    res.json({ success: true, data: distribution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET PERFORMANCE OVERVIEW (Pie Chart)
export const getPerformanceOverview = async (req, res) => {
  try {
    const [scores] = await dbp.query(`
      SELECT 
        SUM(CASE WHEN percentage >= 80 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN percentage < 80 THEN 1 ELSE 0 END) as below_80,
        COUNT(*) as total
      FROM (
        SELECT (score / total_points * 100) as percentage 
        FROM exam_submissions es
        JOIN exams e ON es.assignment_id = e.id
        WHERE es.status = 'graded'
        UNION ALL
        SELECT (score / total_points * 100) as percentage 
        FROM writing_task_submissions wts
        JOIN writing_tasks wt ON wts.assignment_id = wt.id
        WHERE wts.status = 'graded'
      ) results
    `);

    const excellent = scores[0].excellent || 0;
    const below_80 = scores[0].below_80 || 0;
    const total = scores[0].total || 1;

    res.json({
      success: true,
      data: {
        excellent_percent: Math.round((excellent / total) * 100),
        below_80_percent: Math.round((below_80 / total) * 100),
        excellent_count: excellent,
        below_80_count: below_80
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET DETAILED STUDENT LIST WITH PAGINATION, SEARCH, AND FILTERS
export const getDetailedStudentList = async (req, res) => {
  try {
    const { program, class_id, search, limit = 20, offset = 0, sort_by = 'registration_date', order = 'desc' } = req.query;

    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    // Validate sort
    const allowedSorts = ['full_name', 'student_display_id', 'registration_date', 'overall_average', 'approval_status'];
    const sortBy = allowedSorts.includes(sort_by) ? sort_by : 'registration_date';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Base WHERE conditions
    let whereConditions = [];
    let params = [];

    // Note: Since we are unioning two tables with different structures, filtering complexity increases.
    // simpler approach: Wrap the UNION in a subquery or CTE, then filter.
    // However, MySQL 5.7 support for CTE might be limited depending on version. Subquery is safer.

    // Construct Search clause
    const searchClause = search ? `AND (full_name LIKE ? OR email LIKE ? OR student_display_id LIKE ?)` : '';
    if (search) {
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Construct Program clause
    const programClause = program ? `AND chosen_program = ?` : '';
    if (program) {
      params.push(program);
    }

    // Construct Class clause (Only applicable to regular students, but we filter result set)
    const classClause = class_id ? `AND class_id = ?` : '';
    // Note: IELTS students have class_id = NULL/0, so filtering by class excludes them, which is correct behavior if a specific class is selected.
    if (class_id) {
      params.push(class_id);
    }


    const query = `
      SELECT * FROM (
        SELECT 
          s.student_id as student_display_id,
          s.student_id as internal_id,
          s.full_name,
          s.email,
          s.phone,
          s.chosen_program,
          s.chosen_subprogram,
          s.class_id,
          s.created_at as registration_date,
          s.funding_status,
          s.approval_status,
          c.class_name,
          p.title as program_title,
          sp.subprogram_name,
          'regular' as student_type,
          -- Attendance stats
          (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.student_id AND (a.hour1 = 1 OR a.hour2 = 1)) as days_present,
          (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.student_id) as total_attendance_records,
          -- Assignment stats
          (SELECT AVG(percentage) FROM (
            SELECT (es.score / e.total_points * 100) as percentage 
            FROM exam_submissions es
            JOIN exams e ON es.assignment_id = e.id
            WHERE es.student_id = s.student_id AND es.status = 'graded'
            
            UNION ALL
            
            SELECT (wts.score / wt.total_points * 100) as percentage 
            FROM writing_task_submissions wts
            JOIN writing_tasks wt ON wts.assignment_id = wt.id
            WHERE wts.student_id = s.student_id AND wts.status = 'graded'
            
            UNION ALL
            
            SELECT (cws.score / cw.total_points * 100) as percentage 
            FROM course_work_submissions cws
            JOIN course_work cw ON cws.assignment_id = cw.id
            WHERE cws.student_id = s.student_id AND cws.status = 'graded'
          ) all_scores) as overall_average
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN programs p ON (s.chosen_program = p.title COLLATE utf8mb4_unicode_ci OR s.chosen_program = p.id)
        LEFT JOIN subprograms sp ON s.chosen_subprogram = sp.subprogram_name

        UNION ALL

        SELECT 
          CONCAT('IELTS-', email) as student_display_id,
          0 as internal_id,
          CONCAT(first_name, ' ', last_name) as full_name,
          email,
          phone,
          exam_type as chosen_program,
          NULL as chosen_subprogram,
          NULL as class_id,
          registration_date,
          NULL as funding_status,
          status as approval_status,
          'N/A' as class_name,
          exam_type as program_title,
          NULL as subprogram_name,
          'ielts' as student_type,
          0 as days_present,
          0 as total_attendance_records,
          0 as overall_average
        FROM IELTSTOEFL
      ) as combined_results
      WHERE 1=1 
      ${searchClause}
      ${programClause}
      ${classClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    // Add Limit/Offset to params
    params.push(limitNum, offsetNum);

    const [students] = await dbp.query(query, params);

    // Get Total Count for Pagination (using same filters)
    // We need to duplicate params excluding limit/offset for the count query
    const countParams = params.slice(0, -2);

    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 
          s.student_id as student_display_id,
          s.full_name,
          s.email,
          s.chosen_program,
          s.class_id,
          s.approval_status
        FROM students s
        
        UNION ALL

        SELECT 
          CONCAT('IELTS-', i.id) as student_display_id,
          CONCAT(i.first_name, ' ', i.last_name) as full_name,
          i.email,
          i.exam_type as chosen_program,
          NULL as class_id,
          i.status as approval_status
        FROM IELTSTOEFL i
      ) as combined_results
      WHERE 1=1 
      ${searchClause}
      ${programClause}
      ${classClause}
    `;

    const [totalResult] = await dbp.query(countQuery, countParams);

    // Process results
    const processedStudents = students.map(s => {
      const attendanceRate = s.total_attendance_records > 0
        ? Math.round((s.days_present / s.total_attendance_records) * 100)
        : 0;

      return {
        ...s,
        attendance_rate: attendanceRate,
        overall_average: s.overall_average ? Math.round(s.overall_average) : 0
      };
    });

    res.json({
      success: true,
      data: {
        students: processedStudents,
        total: totalResult[0].total,
        page: Math.floor(offsetNum / limitNum) + 1,
        limit: limitNum
      }
    });

  } catch (err) {
    console.error("❌ Get Detailed Student List Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET INDIVIDUAL STUDENT DETAILED REPORT
export const getStudentDetailedReport = async (req, res) => {
  try {
    const { studentId } = req.params; // This is the string ID (e.g. STD-001)

    // Get student basic info and INTERNAL ID
    const [studentInfo] = await dbp.query(`
      SELECT 
        s.*,
        s.id as internal_id,
        c.class_name,
        p.title as program_title,
        sp.subprogram_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN programs p ON s.chosen_program = p.title
      LEFT JOIN subprograms sp ON s.chosen_subprogram = sp.subprogram_name
      WHERE s.student_id = ?
    `, [studentId]);

    if (!studentInfo[0]) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const internalId = studentInfo[0].internal_id;

    // Get attendance details using INTERNAL ID
    const [attendance] = await dbp.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as total_days,
        SUM(CASE WHEN hour1 = 1 OR hour2 = 1 THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN hour1 = 0 AND hour2 = 0 THEN 1 ELSE 0 END) as absent_days
      FROM attendance
      WHERE student_id = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `, [internalId]);

    // Get assignment performance using INTERNAL ID
    const [assignments] = await dbp.query(`
      SELECT 
        'Exam' as type,
        e.title,
        e.total_points as total_marks,
        es.score as marks,
        es.status,
        es.submitted_at,
        (es.score / e.total_points * 100) as percentage
      FROM exam_submissions es
      JOIN exams e ON es.assignment_id = e.id
      WHERE es.student_id = ?
      UNION ALL
      SELECT 
        'Writing Task' as type,
        wt.title,
        wt.total_points as total_marks,
        wts.score as marks,
        wts.status,
        wts.submitted_at,
        (wts.score / wt.total_points * 100) as percentage
      FROM writing_task_submissions wts
      JOIN writing_tasks wt ON wts.assignment_id = wt.id
      WHERE wts.student_id = ?
      UNION ALL
      SELECT 
        'Course Work' as type,
        cw.title,
        cw.total_points as total_marks,
        cws.score as marks,
        cws.status,
        cws.submitted_at,
        (cws.score / cw.total_points * 100) as percentage
      FROM course_work_submissions cws
      JOIN course_work cw ON cws.assignment_id = cw.id
      WHERE cws.student_id = ?
      ORDER BY submitted_at DESC
      LIMIT 20
    `, [internalId, internalId, internalId]);

    // Get performance trends using INTERNAL ID
    const [trends] = await dbp.query(`
      SELECT 
        DATE_FORMAT(submitted_at, '%Y-%m') as month,
        AVG(percentage) as avg_score,
        COUNT(*) as total_submissions
      FROM (
        SELECT submitted_at, (score / total_points * 100) as percentage 
        FROM exam_submissions es
        JOIN exams e ON es.assignment_id = e.id
        WHERE es.student_id = ? AND es.status = 'graded'
        UNION ALL
        SELECT submitted_at, (score / total_points * 100) as percentage 
        FROM writing_task_submissions wts
        JOIN writing_tasks wt ON wts.assignment_id = wt.id
        WHERE wts.student_id = ? AND wts.status = 'graded'
        UNION ALL
        SELECT submitted_at, (score / total_points * 100) as percentage 
        FROM course_work_submissions cws
        JOIN course_work cw ON cws.assignment_id = cw.id
        WHERE cws.student_id = ? AND cws.status = 'graded'
      ) all_submissions
      GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `, [internalId, internalId, internalId]);

    // Add late stats (calculated as days present but maybe specific logic needed, for now simplified)
    const formattedAttendance = attendance.map(a => ({
      ...a,
      late_days: 0 // Schema doesn't strictly support 'late' status, only presence hours
    }));

    res.json({
      success: true,
      data: {
        student: studentInfo[0],
        attendance: formattedAttendance,
        assignments: assignments,
        performance_trends: trends.reverse()
      }
    });
  } catch (err) {
    console.error("❌ Student Detailed Report Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ATTENDANCE ANALYTICS
export const getAttendanceAnalytics = async (req, res) => {
  try {
    const { program, class_id, date_from, date_to } = req.query;

    let whereConditions = ['a.date IS NOT NULL'];
    let params = [];

    if (date_from) {
      whereConditions.push('a.date >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('a.date <= ?');
      params.push(date_to);
    }

    if (class_id) {
      whereConditions.push('a.class_id = ?');
      params.push(class_id);
    }

    if (program) {
      whereConditions.push('s.chosen_program = ?');
      params.push(program);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Note: a.student_id refers to students.id (INT)
    const [analytics] = await dbp.query(`
      SELECT 
        COUNT(DISTINCT a.student_id) as total_students,
        COUNT(*) as total_records,
        SUM(CASE WHEN a.hour1 = 1 OR a.hour2 = 1 THEN 1 ELSE 0 END) as total_present,
        SUM(CASE WHEN a.hour1 = 0 AND a.hour2 = 0 THEN 1 ELSE 0 END) as total_absent,
        0 as total_late,
        0 as avg_attendance_rate
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      ${whereClause}
    `, params);

    const totalRecords = analytics[0].total_records || 0;
    const totalPresent = analytics[0].total_present || 0;
    const avgRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
    analytics[0].avg_attendance_rate = Math.round(avgRate * 100) / 100;

    // Get daily attendance trends
    const [dailyTrends] = await dbp.query(`
      SELECT 
        DATE(a.date) as date,
        COUNT(DISTINCT a.student_id) as students,
        SUM(CASE WHEN a.hour1 = 1 OR a.hour2 = 1 THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.hour1 = 0 AND a.hour2 = 0 THEN 1 ELSE 0 END) as absent
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      ${whereClause}
      GROUP BY DATE(a.date)
      ORDER BY date DESC
      LIMIT 30
    `, params);

    res.json({
      success: true,
      data: {
        summary: analytics[0],
        daily_trends: dailyTrends.reverse()
      }
    });
  } catch (err) {
    console.error("❌ Attendance Analytics Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ASSIGNMENT COMPLETION ANALYTICS
export const getAssignmentCompletionAnalytics = async (req, res) => {
  try {
    const { program, class_id } = req.query;

    let whereConditions = [];
    let params = [];

    if (class_id) {
      whereConditions.push('c.id = ?');
      params.push(class_id);
    }

    if (program) {
      whereConditions.push('s.chosen_program = ?');
      params.push(program);
    }

    const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

    const [analytics] = await dbp.query(`
      SELECT 
        'Exams' as assignment_type,
        COUNT(DISTINCT e.id) as total_assignments,
        COUNT(DISTINCT es.id) as total_submissions,
        SUM(CASE WHEN es.status = 'graded' THEN 1 ELSE 0 END) as graded_submissions,
        AVG(CASE WHEN es.status = 'graded' THEN (es.score / e.total_points * 100) ELSE NULL END) as avg_score
      FROM exams e
      LEFT JOIN exam_submissions es ON e.id = es.assignment_id
      LEFT JOIN students s ON es.student_id = s.student_id
      LEFT JOIN classes c ON e.class_id = c.id
      WHERE 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'Writing Tasks' as assignment_type,
        COUNT(DISTINCT wt.id) as total_assignments,
        COUNT(DISTINCT wts.id) as total_submissions,
        SUM(CASE WHEN wts.status = 'graded' THEN 1 ELSE 0 END) as graded_submissions,
        AVG(CASE WHEN wts.status = 'graded' THEN (wts.score / wt.total_points * 100) ELSE NULL END) as avg_score
      FROM writing_tasks wt
      LEFT JOIN writing_task_submissions wts ON wt.id = wts.assignment_id
      LEFT JOIN students s ON wts.student_id = s.student_id
      LEFT JOIN classes c ON wt.class_id = c.id
      WHERE 1=1 ${whereClause}
      
      UNION ALL
      
      SELECT 
        'Course Work' as assignment_type,
        COUNT(DISTINCT cw.id) as total_assignments,
        COUNT(DISTINCT cws.id) as total_submissions,
        SUM(CASE WHEN cws.status = 'graded' THEN 1 ELSE 0 END) as graded_submissions,
        AVG(CASE WHEN cws.status = 'graded' THEN (cws.score / cw.total_points * 100) ELSE NULL END) as avg_score
      FROM course_work cw
      LEFT JOIN course_work_submissions cws ON cw.id = cws.assignment_id
      LEFT JOIN students s ON cws.student_id = s.student_id
      LEFT JOIN classes c ON cw.class_id = c.id
      WHERE 1=1 ${whereClause}
    `, [...params, ...params, ...params]);

    res.json({
      success: true,
      data: analytics.map(a => ({
        ...a,
        completion_rate: a.total_assignments > 0
          ? Math.round((a.total_submissions / a.total_assignments) * 100)
          : 0,
        avg_score: a.avg_score ? Math.round(a.avg_score) : 0
      }))
    });
  } catch (err) {
    console.error("❌ Assignment Completion Analytics Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET CONSOLIDATED STATS (Gender, Status, Trends)
export const getConsolidatedStats = async (req, res) => {
  try {
    // 1. Gender Distribution
    const [genderDist] = await dbp.query(`
      SELECT 
        CASE 
          WHEN sex IS NULL OR sex = '' THEN 'Unknown'
          ELSE sex 
        END as name,
        COUNT(*) as value
      FROM (
        SELECT sex FROM students
        UNION ALL
        SELECT sex FROM IELTSTOEFL
      ) combined
      GROUP BY name
    `);

    // 2. Status Distribution
    const [statusDist] = await dbp.query(`
      SELECT 
        CASE 
          WHEN status_normalized IN ('approved', 'active') THEN 'Approved'
          WHEN status_normalized IN ('pending', 'waiting') THEN 'Pending'
          WHEN status_normalized IN ('rejected', 'declined') THEN 'Rejected'
          WHEN status_normalized IS NULL OR status_normalized = '' THEN 'Other'
          ELSE 'Other'
        END as name,
        COUNT(*) as value
      FROM (
        SELECT approval_status as status_normalized FROM students
        UNION ALL
        SELECT status as status_normalized FROM IELTSTOEFL
      ) combined
      GROUP BY name
    `);

    // 3. Enrollment Trends (Combined)
    const [enrollmentTrends] = await dbp.query(`
      SELECT 
        DATE_FORMAT(registration_date, '%Y-%m') as month,
        COUNT(*) as students
      FROM (
        SELECT created_at as registration_date FROM students
        UNION ALL
        SELECT registration_date FROM IELTSTOEFL
      ) combined
      WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: {
        gender: genderDist,
        status: statusDist,
        enrollment: enrollmentTrends
      }
    });
  } catch (err) {
    console.error("❌ Consolidated Stats Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

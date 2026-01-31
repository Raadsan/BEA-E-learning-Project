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
        SELECT IFNULL(chosen_program, exam_type) as program_name FROM IELTSTOEFL
      ) combined
      GROUP BY program_name 
      ORDER BY count DESC 
      LIMIT 1
    `);

    // 4. Last Week Registrations
    const [lastWeek] = await dbp.query(`
      SELECT COUNT(*) as total 
      FROM (
        SELECT registration_date FROM students WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
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
        SELECT IFNULL(chosen_program, exam_type) as program_name FROM IELTSTOEFL
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
        SELECT CONCAT(IFNULL(chosen_program, exam_type), ' - ', 'Proficiency') as name FROM IELTSTOEFL
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
    // This is aggregated across all submission types (exams, tasks, etc.)
    // We'll look at the latest submissions and categorize them
    const [scores] = await dbp.query(`
      SELECT 
        SUM(CASE WHEN percentage >= 80 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN percentage < 80 THEN 1 ELSE 0 END) as below_80,
        COUNT(*) as total
      FROM (
        SELECT (marks / total_marks * 100) as percentage 
        FROM exam_submissions 
        WHERE status = 'graded'
        UNION ALL
        SELECT (marks / total_marks * 100) as percentage 
        FROM writing_task_submissions 
        WHERE status = 'graded'
      ) results
    `);

    const excellent = scores[0].excellent || 0;
    const below_80 = scores[0].below_80 || 0;
    const total = scores[0].total || 1; // Avoid division by zero

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

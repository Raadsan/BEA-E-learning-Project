
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Testing Consolidated Stats Queries...");

        // 1. Gender check
        const [genderDist] = await db.promise().query(`
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
        console.log("\nGender Dist:", genderDist);

        // 2. Status check
        const [statusDist] = await db.promise().query(`
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
        console.log("\nStatus Dist:", statusDist);

        // 3. Enrollment check (Standard)
        const [enrollmentTrends] = await db.promise().query(`
      SELECT 
        DATE_FORMAT(registration_date, '%Y-%m') as month,
        COUNT(*) as students
      FROM (
        SELECT registration_date FROM students
        UNION ALL
        SELECT registration_date FROM IELTSTOEFL
      ) combined
      WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
      ORDER BY month ASC
    `);
        console.log("\nEnrollment Trends (Last 12 Month):", enrollmentTrends);

        // 4. Raw Count Check
        const [studentsCount] = await db.promise().query("SELECT COUNT(*) as count FROM students");
        const [ieltsCount] = await db.promise().query("SELECT COUNT(*) as count FROM IELTSTOEFL");
        console.log("\nTotal Students:", studentsCount[0].count);
        console.log("Total IELTS:", ieltsCount[0].count);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

run();

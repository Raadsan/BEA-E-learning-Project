
import db from './backend/database/dbconfig.js';

const run = async () => {
  try {
    console.log("Testing Detailed Student List Query...");

    // Mock parameters
    const limit = 20;
    const offset = 0;
    const searchClause = "";
    const programClause = "";
    const classClause = "";

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
          sp.subprogram_name as subprogram_name,
          'regular' as student_type,
          0 as days_present,
          0 as total_attendance_records,
          0 as overall_average
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN programs p ON (s.chosen_program = p.title COLLATE utf8mb4_unicode_ci OR s.chosen_program = p.id)
        LEFT JOIN subprograms sp ON s.chosen_subprogram = sp.subprogram_name

        UNION ALL

        SELECT 
          CONCAT('IELTS-', id) as student_display_id,
          id as internal_id,
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
      ORDER BY registration_date DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.promise().query(query, [limit, offset]);
    console.log(`Success! Found ${rows.length} rows.`);
    if (rows.length > 0) console.log(rows[0]);

    process.exit(0);
  } catch (err) {
    console.error("❌ SQL Error:", err.sqlMessage || err.message);
    process.exit(1);
  }
};

run();

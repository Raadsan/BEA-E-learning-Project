
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Testing Detailed Student List Query via Controller Logic...");

        const limitNum = 20;
        const offsetNum = 0;
        const sortBy = 'registration_date';
        const sortOrder = 'DESC';
        const search = '';
        const program = '';
        const class_id = '';

        const params = [];

        // Search
        const searchClause = search ? `AND (full_name LIKE ? OR email LIKE ? OR student_display_id LIKE ?)` : '';
        if (search) params.push(`%${search}%`, `%${search}%`, `%${search}%`);

        // Program
        const programClause = program ? `AND chosen_program = ?` : '';
        if (program) params.push(program);

        // Class
        const classClause = class_id ? `AND class_id = ?` : '';
        if (class_id) params.push(class_id);

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
          0 as days_present,
          0 as total_attendance_records,
          0 as overall_average
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

        params.push(limitNum, offsetNum);

        console.log("Executing Query...");
        const [students] = await db.promise().query(query, params);
        console.log(`Success! Found ${students.length} students.`);
        if (students.length > 0) {
            console.log("First student:", students[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Stats Error:", err.message);
        process.exit(1);
    }
};

run();

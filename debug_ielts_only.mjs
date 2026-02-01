
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Testing IELTS Only Query...");
        const query = `
        SELECT 
          CONCAT('IELTS-', id) as student_display_id,
          id as internal_id,
          CONCAT(first_name, ' ', last_name) as full_name,
          email,
          phone,
          exam_type as chosen_program,
          registration_date
        FROM IELTSTOEFL
        LIMIT 5
    `;
        const [rows] = await db.promise().query(query);
        console.log("Success! Rows:", rows);
        process.exit(0);
    } catch (err) {
        console.error("❌ SQL Error:", err.message);
        process.exit(1);
    }
};

run();

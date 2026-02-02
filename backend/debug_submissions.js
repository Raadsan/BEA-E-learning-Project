import db from './database/dbconfig.js';
const dbp = db.promise();

async function debugSubmissions() {
    try {
        console.log("=== Checking oral_assignment_submissions table ===");

        // Get all submissions for assignment ID 3
        const [subs] = await dbp.query(`
            SELECT * FROM oral_assignment_submissions WHERE assignment_id = 3
        `);
        console.log("Raw submissions:", JSON.stringify(subs, null, 2));

        // Check if student exists in students table
        if (subs.length > 0) {
            const studentId = subs[0].student_id;
            console.log("\n=== Checking student in students table ===");
            const [student] = await dbp.query(`
                SELECT * FROM students WHERE student_id = ?
            `, [studentId]);
            console.log("Student in students table:", JSON.stringify(student, null, 2));

            console.log("\n=== Checking student in IELTSTOEFL table ===");
            const [ielts] = await dbp.query(`
                SELECT * FROM IELTSTOEFL WHERE student_id = ?
            `, [studentId]);
            console.log("Student in IELTSTOEFL table:", JSON.stringify(ielts, null, 2));

            // Test the actual query
            console.log("\n=== Testing the actual query ===");
            const [result] = await dbp.query(`
                SELECT s.*, 
                       COALESCE(st.full_name, CONCAT(ielts.first_name, ' ', ielts.last_name)) as student_name,
                       COALESCE(st.email, ielts.email) as student_email
                FROM oral_assignment_submissions s
                LEFT JOIN students st ON s.student_id = st.student_id
                LEFT JOIN IELTSTOEFL ielts ON s.student_id = ielts.student_id
                WHERE s.assignment_id = 3
            `);
            console.log("Query result:", JSON.stringify(result, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

debugSubmissions();

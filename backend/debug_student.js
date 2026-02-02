import db from './database/dbconfig.js';
const dbp = db.promise();

async function debugStudent() {
    try {
        const studentId = 'BEA-ST-GEP-120126-107';

        console.log("=== Checking student in students table ===");
        const [student] = await dbp.query(`
            SELECT * FROM students WHERE student_id = ?
        `, [studentId]);
        console.log("Student:", JSON.stringify(student, null, 2));

        console.log("\n=== Checking student in IELTSTOEFL table ===");
        const [ielts] = await dbp.query(`
            SELECT * FROM IELTSTOEFL WHERE student_id = ?
        `, [studentId]);
        console.log("IELTS Student:", JSON.stringify(ielts, null, 2));

        console.log("\n=== Checking oral assignment submissions ===");
        const [subs] = await dbp.query(`
            SELECT * FROM oral_assignment_submissions WHERE student_id = ?
        `, [studentId]);
        console.log("Submissions:", JSON.stringify(subs, null, 2));

        console.log("\n=== Testing the join query ===");
        const [result] = await dbp.query(`
            SELECT s.*, 
                   COALESCE(st.full_name, CONCAT(ielts.first_name, ' ', ielts.last_name)) as student_name,
                   COALESCE(st.email, ielts.email) as student_email
            FROM oral_assignment_submissions s
            LEFT JOIN students st ON s.student_id = st.student_id
            LEFT JOIN IELTSTOEFL ielts ON s.student_id = ielts.student_id
            WHERE s.student_id = ?
        `, [studentId]);
        console.log("Join result:", JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

debugStudent();

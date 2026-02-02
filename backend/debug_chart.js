
import db from './database/dbconfig.js';
const dbp = db.promise();

async function testQuery() {
    try {
        console.log("Running debug query...");

        // Check raw counts
        const [counts] = await dbp.query("SELECT COUNT(*) as count FROM assignment_submissions");
        console.log("Total submissions:", counts[0].count);

        const [allSubs] = await dbp.query("SELECT id, student_id, score, status FROM assignment_submissions");
        console.log("All Submissions:", allSubs);

        // Run the actual distribution query
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
                WHERE sub.status = 'graded'
            ) as unified
            GROUP BY type, range_name
        `);

        console.log("Distribution Result:", rows);

        // Check sample scores
        const [scores] = await dbp.query("SELECT score FROM assignment_submissions WHERE status = 'graded' LIMIT 5");
        console.log("Sample Scores:", scores);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

testQuery();

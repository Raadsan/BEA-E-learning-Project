import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        const tables = [
            'attendance', 'payments', 'session_change_requests',
            'assignment_submissions', 'placement_test_results',
            'proficiency_test_results', 'writing_task_submissions',
            'test_submissions', 'course_work_submissions', 'oral_assignment_submissions'
        ];

        for (const table of tables) {
            console.log(`\n--- Checking ${table} ---`);
            const [rows] = await dbp.query(`
                SELECT t.student_id 
                FROM ${table} t 
                LEFT JOIN students s ON t.student_id = s.student_id 
                WHERE s.student_id IS NULL
            `).catch(err => {
                console.log(`Skipping ${table}: ${err.message}`);
                return [[]];
            });

            if (rows.length > 0) {
                console.log(`Found ${rows.length} orphaned records. Sample values:`, rows.slice(0, 5).map(r => r.student_id));
            } else {
                console.log("No orphaned records found.");
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

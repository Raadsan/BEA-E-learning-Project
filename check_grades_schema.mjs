
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Checking for Grade/Score Columns in Submission Tables...");

        const tables = ['exam_submissions', 'writing_task_submissions', 'course_work_submissions'];

        for (const table of tables) {
            console.log(`\n--- ${table} ---`);
            const [cols] = await db.promise().query(`SHOW COLUMNS FROM ${table}`);
            // Filter for interesting columns
            const potentialCols = cols
                .map(c => c.Field)
                .filter(f => /mark|grade|score|point|result/i.test(f));

            if (potentialCols.length > 0) {
                console.log("Found potential score columns:", potentialCols);
            } else {
                console.log("No obvious score columns found. Full list:");
                console.log(cols.map(c => c.Field));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

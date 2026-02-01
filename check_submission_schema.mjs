
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Checking Submission Tables Schema...");

        const tables = ['exam_submissions', 'writing_task_submissions', 'course_work_submissions'];

        for (const table of tables) {
            console.log(`\n--- ${table} ---`);
            const [cols] = await db.promise().query(`SHOW COLUMNS FROM ${table}`);
            console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

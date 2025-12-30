
import db from './database/dbconfig.js';

async function checkSchema() {
    try {
        const [rows] = await db.promise().query("SHOW COLUMNS FROM students LIKE 'approval_status'");
        console.log('Column Info:', rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();

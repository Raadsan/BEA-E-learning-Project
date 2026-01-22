
import db from './database/dbconfig.js';

async function checkSpecificColumns() {
    try {
        const [rows] = await db.promise().query("SHOW COLUMNS FROM tests WHERE Field IN ('questions', 'subprogram_id', 'start_date', 'end_date')");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkSpecificColumns();

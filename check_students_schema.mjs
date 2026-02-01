
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Checking students table columns...");
        const [columns] = await db.promise().query("SHOW COLUMNS FROM students");
        console.log(columns.map(c => c.Field));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

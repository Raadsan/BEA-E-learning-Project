
import db from './backend/database/dbconfig.js';

const run = async () => {
    try {
        console.log("Checking IELTSTOEFL Columns...");
        const [cols] = await db.promise().query("SHOW COLUMNS FROM IELTSTOEFL");
        console.log("First 5 Columns:", cols.slice(0, 5).map(c => c.Field));
        console.log("Does registration_date exist?", cols.some(c => c.Field === 'registration_date'));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

import dotenv from 'dotenv';
import db from './database/dbconfig.js';

dotenv.config();

const checkColumns = async () => {
    try {
        const [rows] = await db.promise().query("SHOW COLUMNS FROM tests");
        console.log("Columns in 'tests' table:");
        rows.forEach(row => console.log(row.Field));
        process.exit(0);
    } catch (err) {
        console.error("Error checking columns:", err);
        process.exit(1);
    }
};

checkColumns();

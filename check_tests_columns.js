import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

import db from './backend/database/dbconfig.js';

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

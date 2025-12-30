import mysql from "mysql2";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

async function check() {
    const dbp = db.promise();
    const tables = ['writing_tasks', 'tests', 'oral_assignments', 'course_work'];
    for (const table of tables) {
        try {
            const [columns] = await dbp.query(`SHOW COLUMNS FROM ${table}`);
            const fieldNames = columns.map(c => c.Field);
            console.log(`Table: ${table} | Columns: ${fieldNames.join(', ')}`);
            if (!fieldNames.includes('questions')) {
                console.log(`⚠️ MISSING 'questions' column in ${table}`);
            }
        } catch (e) {
            console.error(`Error checking table ${table}:`, e.message);
        }
    }
    process.exit(0);
}

check();

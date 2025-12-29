import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
});

async function check() {
    const tables = ['writing_tasks', 'tests', 'oral_assignments', 'course_work'];
    for (const table of tables) {
        try {
            const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'status'`);
            if (rows.length > 0) {
                console.log(`Table ${table} HAS status column: ${JSON.stringify(rows[0])}`);
            } else {
                console.log(`Table ${table} MISSING status column!`);
            }
        } catch (e) {
            console.error(`Error checking ${table}:`, e.message);
        }
    }
    await pool.end();
}
check();

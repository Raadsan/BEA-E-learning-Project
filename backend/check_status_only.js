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

async function checkStatusCol() {
    const tables = ['writing_tasks', 'tests', 'oral_assignments', 'course_work'];
    for (const table of tables) {
        try {
            const [rows] = await pool.query(`DESCRIBE ${table}`);
            const statusCol = rows.find(r => r.Field.toLowerCase() === 'status');
            if (statusCol) {
                console.log(`${table} STATUS:`, statusCol);
            } else {
                console.log(`${table} MISSING STATUS!`);
                console.log(`Available columns:`, rows.map(r => r.Field).join(', '));
            }
        } catch (e) {
            console.error(`Error ${table}:`, e.message);
        }
    }
    await pool.end();
}
checkStatusCol();

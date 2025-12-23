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

async function describeTables() {
    const tables = ['announcements', 'attendance', 'assignments', 'assignment_submissions', 'students'];
    for (const table of tables) {
        try {
            console.log(`\n--- Table: ${table} ---`);
            const [rows] = await pool.query(`DESCRIBE ${table}`);
            console.table(rows);
        } catch (error) {
            console.error(`Error describing ${table}:`, error.message);
        }
    }
    await pool.end();
}

describeTables();

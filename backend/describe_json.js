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

async function describeTableJSON(tableName) {
    try {
        const [rows] = await pool.query(`DESCRIBE ${tableName}`);
        console.log(JSON.stringify({ table: tableName, columns: rows }));
    } catch (error) {
        console.error(JSON.stringify({ table: tableName, error: error.message }));
    }
}

async function run() {
    await describeTableJSON('attendance');
    await describeTableJSON('announcements');
    await describeTableJSON('students');
    await pool.end();
}

run();

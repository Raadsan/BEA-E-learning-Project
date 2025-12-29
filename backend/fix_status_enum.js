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

async function fixEnum() {
    const tables = ['writing_tasks', 'tests', 'oral_assignments', 'course_work'];
    for (const table of tables) {
        try {
            console.log(`Updating ENUM for ${table}...`);
            // We'll use MODIFY to update the ENUM list.
            await pool.query(`ALTER TABLE ${table} MODIFY COLUMN status ENUM('active', 'inactive', 'closed') DEFAULT 'active'`);
            console.log(`Successfully updated status ENUM for ${table}.`);
        } catch (error) {
            console.error(`Error updating ${table}:`, error.message);
        }
    }
    await pool.end();
}
fixEnum();

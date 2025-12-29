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

async function addStatusColumn() {
    const tables = ['writing_tasks', 'tests', 'oral_assignments', 'course_work'];

    for (const table of tables) {
        try {
            // Check if column exists
            const [columns] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'status'`);

            if (columns.length === 0) {
                console.log(`Adding status column to ${table}...`);
                await pool.query(`ALTER TABLE ${table} ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'`);
                console.log(`Successfully added status column to ${table}.`);
            } else {
                console.log(`Status column already exists in ${table}.`);
            }
        } catch (error) {
            console.error(`Error processing table ${table}:`, error.message);
        }
    }

    await pool.end();
}

addStatusColumn();

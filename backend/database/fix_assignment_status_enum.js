import mysql from "mysql2";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

async function migrate() {
    const dbp = db.promise();
    try {
        console.log("Starting Migration: Updating status columns to use 'inactive' instead of 'closed'...");

        const tables = ['writing_tasks', 'tests', 'oral_assignments', 'course_work'];

        for (const table of tables) {
            console.log(`Updating table: ${table}`);

            // 1. Convert any 'closed' to 'inactive' (if column allows temporarily or just alter type)
            // In MySQL, we should first alter the column to include both, move the data, then set the final enum.
            // Or just alter to allow 'inactive' and renaming.

            await dbp.query(`ALTER TABLE ${table} MODIFY COLUMN status ENUM('active', 'closed', 'inactive') DEFAULT 'active'`);
            await dbp.query(`UPDATE ${table} SET status = 'inactive' WHERE status = 'closed'`);
            await dbp.query(`ALTER TABLE ${table} MODIFY COLUMN status ENUM('active', 'inactive') DEFAULT 'active'`);

            console.log(`✅ Table '${table}' updated successfully.`);
        }

        console.log("✅ Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

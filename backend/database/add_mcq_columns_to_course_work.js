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
        console.log("Starting Migration: Adding questions column to course_work table...");
        console.log("Connecting to:", process.env.DB_HOST);

        // 1. Add questions column if it doesn't exist
        const [columns] = await dbp.query("SHOW COLUMNS FROM course_work LIKE 'questions'");
        if (columns.length === 0) {
            await dbp.query("ALTER TABLE course_work ADD COLUMN questions LONGTEXT NULL AFTER submission_format");
            console.log("✅ Column 'questions' added to 'course_work' table.");
        } else {
            console.log("ℹ️ Column 'questions' already exists in 'course_work' table.");
        }

        console.log("✅ Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

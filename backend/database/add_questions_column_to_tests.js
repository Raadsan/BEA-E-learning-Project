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
        console.log("Starting Migration: Adding questions column to tests and oral_assignments tables...");

        const tablesToUpdate = ['tests', 'oral_assignments'];

        for (const table of tablesToUpdate) {
            const [columns] = await dbp.query(`SHOW COLUMNS FROM ${table} LIKE 'questions'`);
            if (columns.length === 0) {
                await dbp.query(`ALTER TABLE ${table} ADD COLUMN questions LONGTEXT NULL AFTER duration`);
                console.log(`✅ Column 'questions' added to '${table}' table.`);
            } else {
                console.log(`ℹ️ Column 'questions' already exists in '${table}' table.`);
            }
        }

        console.log("✅ Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

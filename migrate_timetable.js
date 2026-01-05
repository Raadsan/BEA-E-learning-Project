import db from './backend/database/dbconfig.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const migrate = async () => {
    try {
        console.log("Starting migration...");

        // Add date column if it doesn't exist
        try {
            await db.promise().query("ALTER TABLE timetables ADD COLUMN date DATE NULL AFTER subprogram_id");
            console.log("Added 'date' column.");
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAMES') {
                console.log("'date' column already exists.");
            } else {
                throw err;
            }
        }

        // Add type column if it doesn't exist
        try {
            await db.promise().query("ALTER TABLE timetables ADD COLUMN type VARCHAR(50) DEFAULT 'Class' AFTER teacher_id");
            console.log("Added 'type' column.");
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAMES') {
                console.log("'type' column already exists.");
            } else {
                throw err;
            }
        }

        console.log("Migration completed.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();

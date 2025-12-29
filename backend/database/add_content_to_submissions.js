import db from './dbconfig.js';

async function migrate() {
    try {
        console.log("Starting migration: Adding content column to assignment_submissions table...");

        try {
            // Check if column exists first
            const [rows] = await db.promise().query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_NAME = 'assignment_submissions' AND COLUMN_NAME = 'content' AND TABLE_SCHEMA = DATABASE()`
            );

            if (rows.length === 0) {
                await db.promise().query(`ALTER TABLE assignment_submissions ADD COLUMN content LONGTEXT NULL`);
                console.log(`Added column: content`);
            } else {
                console.log(`Column content already exists.`);
            }
        } catch (err) {
            console.error(`Error adding column content:`, err.message);
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exit(1);
    }
}

migrate();

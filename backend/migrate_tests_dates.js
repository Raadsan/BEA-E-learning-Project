import db from './database/dbconfig.js';

const migrate = async () => {
    try {
        const [columns] = await db.promise().query(`SHOW COLUMNS FROM tests`);
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('start_date')) {
            console.log("Adding start_date column...");
            await db.promise().query(`ALTER TABLE tests ADD COLUMN start_date DATETIME NULL AFTER description`);
        } else {
            console.log("start_date column already exists.");
        }

        if (!columnNames.includes('end_date')) {
            console.log("Adding end_date column...");
            await db.promise().query(`ALTER TABLE tests ADD COLUMN end_date DATETIME NULL AFTER start_date`);
        } else {
            console.log("end_date column already exists.");
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();

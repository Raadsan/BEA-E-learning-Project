import db from './dbconfig.js';

async function migrate() {
    try {
        console.log("Starting migration: Adding type-specific columns to assignments table...");

        const columns = [
            { name: 'word_count', type: 'INT NULL' },
            { name: 'duration', type: 'INT NULL' },
            { name: 'submission_format', type: 'VARCHAR(100) NULL' },
            { name: 'requirements', type: 'TEXT NULL' }
        ];

        for (const col of columns) {
            try {
                // Check if column exists first
                const [rows] = await db.promise().query(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'assignments' AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()`,
                    [col.name]
                );

                if (rows.length === 0) {
                    await db.promise().query(`ALTER TABLE assignments ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`Added column: ${col.name}`);
                } else {
                    console.log(`Column ${col.name} already exists.`);
                }
            } catch (err) {
                console.error(`Error adding column ${col.name}:`, err.message);
            }
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exit(1);
    }
}

migrate();

import db from './database/dbconfig.js';

const migrate = async () => {
    try {
        console.log("Modifying class_id column in tests table...");
        // Modify class_id to be nullable
        await db.promise().query(`ALTER TABLE tests MODIFY COLUMN class_id INT NULL`);

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();

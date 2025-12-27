import db from "../database/dbconfig.js";

const updateSchema = async () => {
    try {
        const connection = await db.promise();

        console.log("Checking announcements table schema...");

        // Check if columns exist
        const [columns] = await connection.query("SHOW COLUMNS FROM announcements LIKE 'target_type'");

        if (columns.length === 0) {
            console.log("Adding target_type and target_id columns...");
            await connection.query(`
        ALTER TABLE announcements 
        ADD COLUMN target_type VARCHAR(50) DEFAULT 'manual',
        ADD COLUMN target_id INT DEFAULT NULL
      `);
            console.log("Columns added successfully.");
        } else {
            console.log("Columns already exist.");
        }

        console.log("Schema update complete.");
        process.exit(0);
    } catch (error) {
        console.error("Schema update failed:", error);
        process.exit(1);
    }
};

updateSchema();

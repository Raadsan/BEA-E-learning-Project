
import db from './database/dbconfig.js';

async function addStatusColumn() {
    try {
        console.log("Checking if status column needs to be added to teachers table...");
        const [rows] = await db.promise().query("SHOW COLUMNS FROM teachers LIKE 'status'");

        if (rows.length === 0) {
            console.log("Adding status column to teachers table...");
            await db.promise().query("ALTER TABLE teachers ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER hire_date");
            console.log("✅ Successfully added status column!");
        } else {
            console.log("ℹ️ Status column already exists.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        process.exit();
    }
}

addStatusColumn();

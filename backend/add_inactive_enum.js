
import db from './database/dbconfig.js';

async function fixEnum() {
    try {
        console.log("Modifying approval_status column to include 'inactive'...");
        await db.promise().query("ALTER TABLE students MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'pending'");
        console.log("✅ Successfully updated approval_status enum.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to update table:", err);
        process.exit(1);
    }
}

fixEnum();

import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function addExcusedColumn() {
    try {
        console.log("🔄 Adding 'excused' column to attendance table...");

        // Add excused column (TINYINT) to store count of excused hours (0, 1, or 2)
        // Using IF NOT EXISTS logic via catch or check isn't strictly standard in simple ALTER, 
        // but we'll try to add it. If it fails due to duplicates, we'll catch it.
        try {
            await dbp.query(`
                ALTER TABLE attendance 
                ADD COLUMN excused TINYINT DEFAULT 0 AFTER hour2
            `);
            console.log("✅ 'excused' column added successfully.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ 'excused' column already exists.");
            } else {
                throw e;
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error modifying schema:", err);
        process.exit(1);
    }
}

addExcusedColumn();

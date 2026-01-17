import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const dbp = db.promise();

async function fixColumns() {
    try {
        console.log("🔄 Consolidating attendance columns...");

        // Drop 'excused' if it exists
        try {
            await dbp.query(`ALTER TABLE attendance DROP COLUMN excused`);
            console.log("✅ Dropped 'excused' column.");
        } catch (e) {
            console.log("ℹ️ 'excused' column might not exist or verify manually.");
        }

        // Ensure 'excuse' exists and is TINYINT
        // We'll try to modify it to be sure, or add it if missing (though image shows it exists)
        try {
            // Check if excuse exists first to avoid error if we try to add
            const [rows] = await dbp.query(`SHOW COLUMNS FROM attendance LIKE 'excuse'`);
            if (rows.length === 0) {
                await dbp.query(`ALTER TABLE attendance ADD COLUMN excuse TINYINT DEFAULT 0 AFTER hour2`);
                console.log("✅ Added 'excuse' column.");
            } else {
                await dbp.query(`ALTER TABLE attendance MODIFY COLUMN excuse TINYINT DEFAULT 0`);
                console.log("✅ Verified 'excuse' column schema.");
            }
        } catch (e) {
            console.error("❌ Error ensuring 'excuse' column:", e);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error modifying schema:", err);
        process.exit(1);
    }
}

fixColumns();

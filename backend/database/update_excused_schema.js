import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function updateSchema() {
    try {
        console.log("🔄 Updating attendance table schema...");

        // Modify hour1 and hour2 to be TINYINT to support 0, 1, 2
        // 0 = Absent, 1 = Present, 2 = Excused
        await dbp.query(`
            ALTER TABLE attendance 
            MODIFY COLUMN hour1 TINYINT DEFAULT 0,
            MODIFY COLUMN hour2 TINYINT DEFAULT 0
        `);

        console.log("✅ Updated attendance table schema to support 'Excused' status (TINYINT)");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating schema:", err);
        process.exit(1);
    }
}

updateSchema();

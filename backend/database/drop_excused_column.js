import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' }); // Adjust path to find .env from backend/database if running from there, or use absolute path.
// Actually, if I run from backend/ directory as CWD, dotenv.config() should find .env in CWD.
// But to be safe let's just use the same pattern as before or rely on CWD.

const dbp = db.promise();

async function dropExcusedColumn() {
    try {
        console.log("🔄 Dropping 'excused' column from attendance table...");

        try {
            await dbp.query(`
                ALTER TABLE attendance 
                DROP COLUMN excused
            `);
            console.log("✅ 'excused' column dropped successfully.");
        } catch (e) {
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log("ℹ️ 'excused' column does not exist.");
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

dropExcusedColumn();

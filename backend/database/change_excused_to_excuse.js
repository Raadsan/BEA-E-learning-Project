import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const dbp = db.promise();

async function renameColumn() {
    try {
        console.log("🔄 Adjusting attendance table columns...");
        const [rows] = await dbp.query(`SHOW COLUMNS FROM attendance`);
        const columns = rows.map(r => r.Field);

        const hasExcused = columns.includes('excused');
        const hasExcuse = columns.includes('excuse');

        if (hasExcuse && hasExcused) {
            console.log("ℹ️ Both 'excuse' and 'excused' exist. Dropping 'excused'...");
            await dbp.query(`ALTER TABLE attendance DROP COLUMN excused`);
            console.log("✅ Dropped 'excused'. 'excuse' column remains.");
        } else if (hasExcused && !hasExcuse) {
            console.log("ℹ️ Renaming 'excused' to 'excuse'...");
            await dbp.query(`ALTER TABLE attendance CHANGE COLUMN excused excuse TINYINT DEFAULT 0`);
            console.log("✅ Renamed 'excused' to 'excuse'.");
        } else if (!hasExcused && hasExcuse) {
            console.log("✅ 'excuse' column already exists and 'excused' is gone. No action needed.");
        } else {
            console.log("⚠️ Neither 'excuse' nor 'excused' found. Adding 'excuse'...");
            await dbp.query(`ALTER TABLE attendance ADD COLUMN excuse TINYINT DEFAULT 0 AFTER hour2`);
            console.log("✅ Added 'excuse' column.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error modifying schema:", err);
        process.exit(1);
    }
}

renameColumn();

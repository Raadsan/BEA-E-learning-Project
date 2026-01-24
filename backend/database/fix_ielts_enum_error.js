
import db from "./dbconfig.js";

const dbp = db.promise();

async function fixIeltsEnumError() {
    try {
        console.log("Starting migration: Broadening IELTSTOEFL columns...");

        // 1. Broaden 'exam_type' to VARCHAR(255)
        console.log("Broadening 'exam_type' column...");
        await dbp.query("ALTER TABLE IELTSTOEFL MODIFY COLUMN exam_type VARCHAR(255) NOT NULL");

        // 2. Broaden 'verification_method' to VARCHAR(255)
        console.log("Broadening 'verification_method' column...");
        await dbp.query("ALTER TABLE IELTSTOEFL MODIFY COLUMN verification_method VARCHAR(255) NOT NULL");

        console.log("✅ Columns broadened successfully. The 'Data truncated' error should be fixed.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

fixIeltsEnumError();

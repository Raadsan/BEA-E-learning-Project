
import db from "./dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("Starting migration: Adding ielts_student_id to Payments...");

        const [columns] = await dbp.query("SHOW COLUMNS FROM payments");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('ielts_student_id')) {
            await dbp.query("ALTER TABLE payments ADD COLUMN ielts_student_id INT NULL AFTER student_id");
            console.log("✅ ielts_student_id added to payments table");
        } else {
            console.log("⚠️ ielts_student_id already exists");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

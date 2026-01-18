
import db from "./dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("Starting migration: Extending Payments Table for IELTS...");

        const [columns] = await dbp.query("SHOW COLUMNS FROM payments");
        const columnNames = columns.map(c => c.Field);

        // 1. Make student_id nullable (since it's an IELTS student, it might not be in main students table)
        await dbp.query("ALTER TABLE payments MODIFY student_id INT NULL");
        console.log("✅ student_id made nullable");

        // 2. Add ielts_student_id column
        if (!columnNames.includes('ielts_student_id')) {
            await dbp.query("ALTER TABLE payments ADD COLUMN ielts_student_id INT NULL AFTER student_id");
            await dbp.query("ALTER TABLE payments ADD CONSTRAINT fk_ielts_student FOREIGN KEY (ielts_student_id) REFERENCES IELTSTOEFL(id) ON DELETE CASCADE");
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

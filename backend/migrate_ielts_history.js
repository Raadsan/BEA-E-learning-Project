
import db from "./database/dbconfig.js";

async function migrate() {
    const dbp = db.promise();
    try {
        console.log("Populating history from IELTSTOEFL students...");
        await dbp.query(`
            INSERT IGNORE INTO student_class_history (student_id, class_id, subprogram_id, is_active)
            SELECT s.student_id, s.class_id, c.subprogram_id, 1
            FROM IELTSTOEFL s
            JOIN classes c ON s.class_id = c.id
            WHERE s.class_id IS NOT NULL;
        `);

        console.log("✅ IELTS history seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

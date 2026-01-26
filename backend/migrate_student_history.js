
import db from "./database/dbconfig.js";

async function migrate() {
    const dbp = db.promise();
    try {
        console.log("Creating student_class_history table...");
        await dbp.query(`
            CREATE TABLE IF NOT EXISTS student_class_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                class_id INT NOT NULL,
                subprogram_id INT,
                is_active TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_link (student_id, class_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log("Populating initial history from current students...");
        await dbp.query(`
            INSERT IGNORE INTO student_class_history (student_id, class_id, subprogram_id, is_active)
            SELECT s.student_id, s.class_id, c.subprogram_id, 1
            FROM students s
            JOIN classes c ON s.class_id = c.id
            WHERE s.class_id IS NOT NULL;
        `);

        console.log("✅ Migration successful");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

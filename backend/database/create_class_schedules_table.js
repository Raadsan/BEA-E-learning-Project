// database/create_class_schedules_table.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function createTable() {
    try {
        console.log("🔄 Creating class_schedules table...");
        await dbp.query(`
      CREATE TABLE IF NOT EXISTS class_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        session_title VARCHAR(255),
        zoom_link TEXT,
        schedule_date DATE,
        start_time TIME,
        end_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        INDEX idx_class_id (class_id),
        INDEX idx_date (schedule_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("✅ Created class_schedules table");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating table:", err);
        process.exit(1);
    }
}

createTable();

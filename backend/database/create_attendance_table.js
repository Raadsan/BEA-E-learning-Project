// database/create_attendance_table.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function createTable() {
    try {
        console.log("🔄 Creating attendance table...");

        await dbp.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        hour1 BOOLEAN DEFAULT FALSE,
        hour2 BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (class_id, student_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        console.log("✅ Created attendance table");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating attendance table:", err);
        process.exit(1);
    }
}

createTable();

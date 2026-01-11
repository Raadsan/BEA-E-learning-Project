// database/create_shifts_table.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function createShiftsTable() {
  try {
    console.log("🔄 Creating shifts table...");

    await dbp.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shift_name VARCHAR(255) NOT NULL,
        session_type VARCHAR(100) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Created shifts table successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating shifts table:", err);
    process.exit(1);
  }
}

createShiftsTable();

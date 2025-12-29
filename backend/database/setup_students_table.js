// Setup students table with all required columns
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function setupStudentsTable() {
    try {
        console.log("🔄 Setting up students table...\n");

        // Create students table with all required columns
        await dbp.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(50),
                age INT,
                gender VARCHAR(20),
                residency_country VARCHAR(100),
                residency_city VARCHAR(100),
                chosen_program INT,
                chosen_subprogram INT,
                password VARCHAR(255) NOT NULL,
                parent_name VARCHAR(255),
                parent_email VARCHAR(255),
                parent_phone VARCHAR(50),
                parent_relation VARCHAR(100),
                parent_res_county VARCHAR(100),
                parent_res_city VARCHAR(100),
                class_id INT,
                approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_chosen_program (chosen_program),
                INDEX idx_chosen_subprogram (chosen_subprogram),
                INDEX idx_class_id (class_id),
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log("✅ Students table created successfully!");

        // Check if table has data
        const [count] = await dbp.query("SELECT COUNT(*) as total FROM students");
        console.log(`📊 Total students in table: ${count[0].total}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up students table:", err.message);
        process.exit(1);
    }
}

setupStudentsTable();

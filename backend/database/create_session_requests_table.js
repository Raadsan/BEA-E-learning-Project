import db from "./dbconfig.js";

const dbp = db.promise();

async function createSessionRequestsTable() {
    try {
        console.log("Creating session_change_requests table...");

        await dbp.query(`
      CREATE TABLE IF NOT EXISTS session_change_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        current_class_id INT,
        requested_class_id INT,
        requested_session_type VARCHAR(50),
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (current_class_id) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (requested_class_id) REFERENCES classes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        console.log("✅ session_change_requests table created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating session_change_requests table:", error);
        process.exit(1);
    }
}

createSessionRequestsTable();

import db from "./dbconfig.js";

const dbp = db.promise();

async function createNotificationsTable() {
    try {
        console.log("🔄 Creating notifications table...");

        await dbp.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT, 
        sender_id INT,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        metadata JSON,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        // Note: user_id can be NULL if it's a broadcast to all admins, or specific to an admin ID. 
        // For this use case, we might send to all admins or a specific one. 
        // Let's assume user_id 0 or NULL means "System/All Admins" for now, or we assign to a specific admin.

        console.log("✅ Created notifications table");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating notifications table:", err);
        process.exit(1);
    }
}

createNotificationsTable();

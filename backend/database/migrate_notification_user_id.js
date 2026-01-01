
import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory regardless of where the script is run
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

const dbp = db.promise();

async function migrate() {
    try {
        console.log("🔄 Starting migration to align ID types...");

        // 1. Align notifications.user_id and sender_id to VARCHAR(50)
        console.log("   - Modifying notifications.user_id to VARCHAR(50)...");
        await dbp.query(`ALTER TABLE notifications MODIFY COLUMN user_id VARCHAR(50)`);
        console.log("   ✅ notifications.user_id modified.");

        console.log("   - Modifying notifications.sender_id to VARCHAR(50)...");
        await dbp.query(`ALTER TABLE notifications MODIFY COLUMN sender_id VARCHAR(50)`);
        console.log("   ✅ notifications.sender_id modified.");

        // 2. Align session_change_requests.student_id to VARCHAR(50)
        // NOTE: This might require dropping the foreign key first if it exists.
        console.log("   - Checking for foreign keys on session_change_requests.student_id...");

        // Attempt to drop the foreign key if it's there (based on create_session_requests_table.js)
        try {
            await dbp.query(`ALTER TABLE session_change_requests DROP FOREIGN KEY session_change_requests_ibfk_1`);
            console.log("   ✅ Dropped foreign key session_change_requests_ibfk_1.");
        } catch (e) {
            console.log("   ℹ️  Foreign key not found or already dropped. Proceeding...");
        }

        console.log("   - Modifying session_change_requests.student_id to VARCHAR(50)...");
        await dbp.query(`ALTER TABLE session_change_requests MODIFY COLUMN student_id VARCHAR(50) NOT NULL`);
        console.log("   ✅ session_change_requests.student_id modified.");

        console.log("\n🎉 Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();

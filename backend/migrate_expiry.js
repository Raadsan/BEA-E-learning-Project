
import db from './database/dbconfig.js';

const dbp = db.promise();

async function migrate() {
    try {
        console.log("🚀 Starting migration...");

        // 1. Add expiry_date column
        try {
            await dbp.query("ALTER TABLE IELTSTOEFL ADD COLUMN expiry_date DATETIME DEFAULT NULL");
            console.log("✅ Added expiry_date column");
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log("⚠️ expiry_date column already exists");
            } else {
                throw err;
            }
        }

        // 2. Add admin_expiry_notified column
        try {
            await dbp.query("ALTER TABLE IELTSTOEFL ADD COLUMN admin_expiry_notified BOOLEAN DEFAULT FALSE");
            console.log("✅ Added admin_expiry_notified column");
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log("⚠️ admin_expiry_notified column already exists");
            } else {
                throw err;
            }
        }

        // 3. Initialize existing rows: Set expiry_date = registration_date + 10 minutes
        await dbp.query("UPDATE IELTSTOEFL SET expiry_date = DATE_ADD(registration_date, INTERVAL 10 MINUTE) WHERE expiry_date IS NULL");
        console.log("✅ Initialized expiry_date for existing students");

        console.log("🎉 Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

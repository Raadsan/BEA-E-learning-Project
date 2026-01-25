import db from './dbconfig.js';

async function migrate() {
    try {
        const [columns] = await db.promise().query("SHOW COLUMNS FROM IELTSTOEFL LIKE 'reminder_sent'");
        if (columns.length === 0) {
            await db.promise().query("ALTER TABLE IELTSTOEFL ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE");
            console.log("✅ Added reminder_sent column");
        } else {
            console.log("⚠️ reminder_sent column already exists");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();

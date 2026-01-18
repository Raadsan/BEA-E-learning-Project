
import db from "./dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("Starting migration: Adding Payment Columns to IELTSTOEFL...");

        const [columns] = await dbp.query("SHOW COLUMNS FROM IELTSTOEFL");
        const columnNames = columns.map(c => c.Field);

        const adds = [];
        if (!columnNames.includes('payment_method')) {
            adds.push("ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL");
        }
        if (!columnNames.includes('transaction_id')) {
            adds.push("ADD COLUMN transaction_id VARCHAR(255) DEFAULT NULL");
        }
        if (!columnNames.includes('payment_amount')) {
            adds.push("ADD COLUMN payment_amount DECIMAL(10, 2) DEFAULT NULL");
        }
        if (!columnNames.includes('payer_phone')) {
            adds.push("ADD COLUMN payer_phone VARCHAR(50) DEFAULT NULL");
        }

        if (adds.length > 0) {
            const query = `ALTER TABLE IELTSTOEFL ${adds.join(', ')}`;
            await dbp.query(query);
            console.log("✅ Columns added successfully");
        } else {
            console.log("⚠️ Columns already exist");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

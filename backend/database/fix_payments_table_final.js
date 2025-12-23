// backend/database/fix_payments_table_final.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function fixPaymentsTable() {
    console.log("🚀 Starting final payments table fix...");

    try {
        // 1. Create table if not exists (baseline)
        await dbp.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
        console.log("✅ Baseline table checked.");

        // 2. Add missing columns one by one
        const columnsToAdd = [
            { name: 'payer_phone', type: 'VARCHAR(20)' },
            { name: 'program_id', type: 'VARCHAR(100)' },
            { name: 'provider_transaction_id', type: 'VARCHAR(255)' },
            { name: 'currency', type: 'VARCHAR(10) DEFAULT "USD"' },
            { name: 'raw_response', type: 'JSON' }
        ];

        const [columns] = await dbp.query("SHOW COLUMNS FROM payments");
        const existingColumnNames = columns.map(c => c.Field);

        for (const col of columnsToAdd) {
            if (!existingColumnNames.includes(col.name)) {
                console.log(`📝 Adding missing column: ${col.name}...`);
                await dbp.query(`ALTER TABLE payments ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Column ${col.name} added.`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists.`);
            }
        }

        console.log("🎉 Payments table fixed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing payments table:", error);
        process.exit(1);
    }
}

fixPaymentsTable();

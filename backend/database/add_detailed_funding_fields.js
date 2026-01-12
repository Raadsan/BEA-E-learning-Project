// add_detailed_funding_fields.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addDetailedFields() {
    try {
        console.log("Starting to add detailed funding fields to students table...");

        // Check if columns already exist
        const [columns] = await dbp.query(
            `SHOW COLUMNS FROM students`
        );

        const columnNames = columns.map(c => c.Field);

        const fieldsToAdd = [
            { name: 'funding_amount', type: 'DECIMAL(10, 2) DEFAULT NULL' },
            { name: 'funding_month', type: 'VARCHAR(50) DEFAULT NULL' },
            { name: 'scholarship_percentage', type: 'INT DEFAULT NULL' }
        ];

        for (const field of fieldsToAdd) {
            if (!columnNames.includes(field.name)) {
                console.log(`Adding '${field.name}' column...`);
                await dbp.query(`ALTER TABLE students ADD COLUMN ${field.name} ${field.type} AFTER sponsorship_package`);
                console.log(`✅ Added ${field.name} column`);
            } else {
                console.log(`⚠️ ${field.name} column already exists`);
            }
        }

        console.log("✅ Detailed funding fields added successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding detailed funding fields:", error);
        process.exit(1);
    }
}

addDetailedFields();

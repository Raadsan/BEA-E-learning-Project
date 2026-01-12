// migrate_detailed_funding_and_sex.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("Starting migration: Detailed Funding & Gender Rename...");

        const migrateTable = async (tableName) => {
            const [columns] = await dbp.query(`SHOW COLUMNS FROM ${tableName}`);
            const columnNames = columns.map(c => c.Field);

            if (columnNames.includes('gender')) {
                console.log(`Renaming 'gender' to 'sex' in ${tableName}...`);
                await dbp.query(`ALTER TABLE ${tableName} CHANGE gender sex ENUM('Male', 'Female') DEFAULT 'Male'`);
                console.log(`✅ Renamed gender to sex in ${tableName}`);
            } else if (columnNames.includes('sex')) {
                console.log(`Updating 'sex' column type in ${tableName}...`);
                await dbp.query(`ALTER TABLE ${tableName} MODIFY sex ENUM('Male', 'Female') DEFAULT 'Male'`);
                console.log(`✅ Updated sex column type in ${tableName}`);
            }
            return columnNames;
        };

        const studentColumnNames = await migrateTable('students');
        await migrateTable('IELTSTOEFL');

        // 2. Add funding fields if they don't exist
        const fieldsToAdd = [
            { name: 'funding_status', type: "ENUM('Paid', 'Full Scholarship', 'Partial Scholarship', 'Sponsorship') DEFAULT 'Paid'" },
            { name: 'sponsorship_package', type: "ENUM('1 Month', '3 Months', '6 Months', '1 Year', 'None') DEFAULT 'None'" },
            { name: 'funding_amount', type: 'DECIMAL(10, 2) DEFAULT NULL' },
            { name: 'funding_month', type: 'VARCHAR(50) DEFAULT NULL' },
            { name: 'scholarship_percentage', type: 'INT DEFAULT NULL' }
        ];

        let lastField = 'chosen_subprogram';
        for (const field of fieldsToAdd) {
            if (!studentColumnNames.includes(field.name)) {
                console.log(`Adding '${field.name}' column...`);
                await dbp.query(`ALTER TABLE students ADD COLUMN ${field.name} ${field.type} AFTER ${lastField}`);
                console.log(`✅ Added ${field.name} column`);
            } else {
                console.log(`⚠️ ${field.name} column already exists`);
            }
            lastField = field.name;
        }

        console.log("✅ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

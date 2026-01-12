// update_students_funding_schema.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function updateStudentsSchema() {
    try {
        console.log("Starting to update students table schema...");

        // Check if columns already exist
        const [columns] = await dbp.query(
            `SHOW COLUMNS FROM students`
        );

        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('funding_status')) {
            console.log("Adding 'funding_status' column...");
            await dbp.query(`
        ALTER TABLE students 
        ADD COLUMN funding_status ENUM('Paid', 'Full Scholarship', 'Partial Scholarship', 'Sponsorship') 
        DEFAULT 'Paid' AFTER chosen_subprogram
      `);
            console.log("✅ Added funding_status column");
        } else {
            console.log("⚠️ funding_status column already exists");
        }

        if (!columnNames.includes('sponsorship_package')) {
            console.log("Adding 'sponsorship_package' column...");
            await dbp.query(`
        ALTER TABLE students 
        ADD COLUMN sponsorship_package ENUM('1 Month', '3 Months', '6 Months', '1 Year', 'None') 
        DEFAULT 'None' AFTER funding_status
      `);
            console.log("✅ Added sponsorship_package column");
        } else {
            console.log("⚠️ sponsorship_package column already exists");
        }

        console.log("✅ Schema update completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating students table schema:", error);
        process.exit(1);
    }
}

updateStudentsSchema();

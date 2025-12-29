import db from "./dbconfig.js";

const dbp = db.promise();

async function updateAssignmentsTable() {
    try {
        console.log("🔄 Updating assignments table...");

        // Add created_by column if it doesn't exist
        const [columns] = await dbp.query("SHOW COLUMNS FROM assignments");
        const hasCreatedBy = columns.some(col => col.Field === 'created_by');

        if (!hasCreatedBy) {
            await dbp.query("ALTER TABLE assignments ADD COLUMN created_by INT AFTER program_id");
            console.log("✅ Added created_by column");
        }

        // Update type ENUM to include new categories
        // Note: In MySQL, we need to redefine the ENUM
        await dbp.query(`
            ALTER TABLE assignments 
            MODIFY COLUMN type ENUM(
                'assignment', 'classwork', 'homework', 'project',
                'writing_task', 'course_work', 'test', 'oral_assignment'
            ) DEFAULT 'assignment'
        `);
        console.log("✅ Updated type ENUM categories");

        console.log("\n✅ Assignments table updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating assignments table:", err);
        process.exit(1);
    }
}

updateAssignmentsTable();

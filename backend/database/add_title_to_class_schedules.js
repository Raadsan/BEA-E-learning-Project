// add_title_to_class_schedules.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addTitleField() {
  try {
    console.log("🔄 Adding title field to class_schedules table...");

    // Check if column already exists
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'class_schedules' 
      AND COLUMN_NAME = 'title'
    `);

    if (columns.length === 0) {
      await dbp.query(`
        ALTER TABLE class_schedules 
        ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER class_id
      `);
      console.log("✅ Added title column");
    } else {
      console.log("ℹ️ title column already exists");
    }

    console.log("✅ Migration completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error adding title field:", err);
    process.exit(1);
  }
}

addTitleField();


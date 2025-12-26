// add_time_fields_to_class_schedules.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addTimeFields() {
  try {
    console.log("🔄 Adding start_time and end_time fields to class_schedules table...");

    // Check if columns already exist
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'class_schedules' 
      AND COLUMN_NAME IN ('start_time', 'end_time')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    if (!existingColumns.includes('start_time')) {
      await dbp.query(`
        ALTER TABLE class_schedules 
        ADD COLUMN start_time TIME DEFAULT NULL
      `);
      console.log("✅ Added start_time column");
    } else {
      console.log("ℹ️ start_time column already exists");
    }

    if (!existingColumns.includes('end_time')) {
      await dbp.query(`
        ALTER TABLE class_schedules 
        ADD COLUMN end_time TIME DEFAULT NULL
      `);
      console.log("✅ Added end_time column");
    } else {
      console.log("ℹ️ end_time column already exists");
    }

    console.log("✅ Migration completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error adding time fields:", err);
    process.exit(1);
  }
}

addTimeFields();


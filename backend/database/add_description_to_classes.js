// add_description_to_classes.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addDescriptionToClasses() {
  try {
    console.log("Starting to add description column to classes table...");

    // Check if the column already exists
    const [columns] = await dbp.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'classes' 
       AND COLUMN_NAME = 'description'`
    );

    if (columns.length > 0) {
      console.log("✅ description column already exists in classes table. Nothing to do.");
      process.exit(0);
    }

    // Add the description column
    console.log("Adding description column...");
    await dbp.query(
      `ALTER TABLE classes 
       ADD COLUMN description TEXT NULL AFTER class_name`
    );

    console.log("✅ Successfully added description column to classes table!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding description column:", error);
    process.exit(1);
  }
}

addDescriptionToClasses();


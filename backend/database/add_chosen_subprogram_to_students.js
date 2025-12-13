// add_chosen_subprogram_to_students.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addChosenSubprogramToStudents() {
  try {
    console.log("Starting to add chosen_subprogram column to students table...");

    // Check if the column already exists
    const [columns] = await dbp.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students' 
       AND COLUMN_NAME = 'chosen_subprogram'`
    );

    if (columns.length > 0) {
      console.log("✅ chosen_subprogram column already exists in students table. Nothing to do.");
      process.exit(0);
    }

    // Add the chosen_subprogram column
    console.log("Adding chosen_subprogram column...");
    await dbp.query(
      `ALTER TABLE students 
       ADD COLUMN chosen_subprogram VARCHAR(255) NULL AFTER chosen_program`
    );

    console.log("✅ Successfully added chosen_subprogram column to students table!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding chosen_subprogram column:", error);
    process.exit(1);
  }
}

addChosenSubprogramToStudents();


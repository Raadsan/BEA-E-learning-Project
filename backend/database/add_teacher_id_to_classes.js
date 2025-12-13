// add_teacher_id_to_classes.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addTeacherIdToClasses() {
  try {
    console.log("Starting to add teacher_id column to classes table...");

    // Check if the column already exists
    const [columns] = await dbp.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'classes' 
       AND COLUMN_NAME = 'teacher_id'`
    );

    if (columns.length > 0) {
      console.log("✅ teacher_id column already exists in classes table. Nothing to do.");
      process.exit(0);
    }

    // Add the teacher_id column
    console.log("Adding teacher_id column...");
    await dbp.query(
      `ALTER TABLE classes 
       ADD COLUMN teacher_id INT NULL AFTER course_id,
       ADD CONSTRAINT fk_classes_teacher 
       FOREIGN KEY (teacher_id) REFERENCES teachers(id) 
       ON DELETE SET NULL`
    );

    console.log("✅ Successfully added teacher_id column to classes table!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding teacher_id column:", error);
    process.exit(1);
  }
}

addTeacherIdToClasses();


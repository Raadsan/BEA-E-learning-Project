// update_classes_schema.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function updateClassesSchema() {
  try {
    console.log("Starting to update classes table schema...");

    // Check current column definitions
    const [columns] = await dbp.query(
      `SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'classes' 
       AND COLUMN_NAME IN ('course_id', 'teacher_id', 'description', 'schedule')`
    );

    console.log("Current column definitions:", columns);

    // Make course_id nullable if it isn't
    const courseIdColumn = columns.find(c => c.COLUMN_NAME === 'course_id');
    if (courseIdColumn && courseIdColumn.IS_NULLABLE === 'NO') {
      console.log("Making course_id nullable...");
      await dbp.query(`ALTER TABLE classes MODIFY COLUMN course_id INT NULL`);
      console.log("✅ course_id is now nullable");
    } else if (courseIdColumn) {
      console.log("✅ course_id is already nullable");
    }

    // Make teacher_id nullable if it isn't
    const teacherIdColumn = columns.find(c => c.COLUMN_NAME === 'teacher_id');
    if (teacherIdColumn && teacherIdColumn.IS_NULLABLE === 'NO') {
      console.log("Making teacher_id nullable...");
      await dbp.query(`ALTER TABLE classes MODIFY COLUMN teacher_id INT NULL`);
      console.log("✅ teacher_id is now nullable");
    } else if (teacherIdColumn) {
      console.log("✅ teacher_id is already nullable");
    } else {
      console.log("⚠️ teacher_id column doesn't exist - will be added by add_teacher_id_to_classes.js");
    }

    // Make schedule nullable if it isn't
    const scheduleColumn = columns.find(c => c.COLUMN_NAME === 'schedule');
    if (scheduleColumn && scheduleColumn.IS_NULLABLE === 'NO') {
      console.log("Making schedule nullable...");
      await dbp.query(`ALTER TABLE classes MODIFY COLUMN schedule VARCHAR(255) NULL`);
      console.log("✅ schedule is now nullable");
    } else if (scheduleColumn) {
      console.log("✅ schedule is already nullable");
    }

    // Check if description column exists
    const descriptionColumn = columns.find(c => c.COLUMN_NAME === 'description');
    if (!descriptionColumn) {
      console.log("Adding description column...");
      await dbp.query(`ALTER TABLE classes ADD COLUMN description TEXT NULL AFTER class_name`);
      console.log("✅ description column added");
    } else {
      console.log("✅ description column already exists");
    }

    console.log("✅ Successfully updated classes table schema!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating classes schema:", error);
    process.exit(1);
  }
}

updateClassesSchema();


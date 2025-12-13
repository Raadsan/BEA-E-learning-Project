// drop_teacher_id_from_classes.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function dropTeacherIdFromClasses() {
  try {
    console.log("Starting to drop teacher_id from classes table...");

    // Check if the column exists
    const [columns] = await dbp.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'classes' 
       AND COLUMN_NAME = 'teacher_id'`
    );

    if (columns.length === 0) {
      console.log("✅ teacher_id column does not exist in classes table. Nothing to do.");
      process.exit(0);
    }

    // Check for foreign key constraints
    const [foreignKeys] = await dbp.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'classes' 
       AND COLUMN_NAME = 'teacher_id' 
       AND REFERENCED_TABLE_NAME IS NOT NULL`
    );

    // Drop foreign key constraints
    for (const fk of foreignKeys) {
      const constraintName = fk.CONSTRAINT_NAME;
      console.log(`Dropping foreign key constraint: ${constraintName}`);
      await dbp.query(`ALTER TABLE classes DROP FOREIGN KEY ${constraintName}`);
    }

    // Check for indexes on teacher_id
    const [indexes] = await dbp.query(
      `SELECT INDEX_NAME 
       FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'classes' 
       AND COLUMN_NAME = 'teacher_id'`
    );

    // Drop indexes (except primary key)
    for (const idx of indexes) {
      const indexName = idx.INDEX_NAME;
      if (indexName !== 'PRIMARY') {
        console.log(`Dropping index: ${indexName}`);
        await dbp.query(`ALTER TABLE classes DROP INDEX ${indexName}`);
      }
    }

    // Drop the column
    console.log("Dropping teacher_id column...");
    await dbp.query(`ALTER TABLE classes DROP COLUMN teacher_id`);

    console.log("✅ Successfully dropped teacher_id column from classes table!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping teacher_id column:", error);
    process.exit(1);
  }
}

dropTeacherIdFromClasses();


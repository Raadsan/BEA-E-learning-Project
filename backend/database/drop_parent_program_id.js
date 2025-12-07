// Drop parent_program_id column from programs table
import db from "./dbconfig.js";

const dbp = db.promise();

async function dropParentProgramId() {
  try {
    console.log("🔄 Starting to drop parent_program_id column...");

    // Check if column exists
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'programs'
      AND COLUMN_NAME = 'parent_program_id'
    `);

    if (columns.length === 0) {
      console.log("ℹ️  parent_program_id column does not exist. Nothing to drop.");
      return;
    }

    console.log("✅ parent_program_id column found.");

    // Drop foreign key constraint first
    try {
      await dbp.query(`
        ALTER TABLE programs 
        DROP FOREIGN KEY programs_ibfk_1
      `);
      console.log("✅ Dropped foreign key constraint");
    } catch (err) {
      // Try alternative constraint names
      try {
        await dbp.query(`
          ALTER TABLE programs 
          DROP FOREIGN KEY fk_parent_program
        `);
        console.log("✅ Dropped foreign key constraint (fk_parent_program)");
      } catch (err2) {
        // Get the actual constraint name
        const [constraints] = await dbp.query(`
          SELECT CONSTRAINT_NAME 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'programs'
          AND COLUMN_NAME = 'parent_program_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        if (constraints.length > 0) {
          const constraintName = constraints[0].CONSTRAINT_NAME;
          await dbp.query(`
            ALTER TABLE programs 
            DROP FOREIGN KEY ${constraintName}
          `);
          console.log(`✅ Dropped foreign key constraint (${constraintName})`);
        } else {
          console.log("ℹ️  No foreign key constraint found (may have been dropped already)");
        }
      }
    }

    // Drop index
    try {
      await dbp.query(`
        ALTER TABLE programs 
        DROP INDEX idx_parent_program_id
      `);
      console.log("✅ Dropped index idx_parent_program_id");
    } catch (err) {
      console.log("ℹ️  Index idx_parent_program_id not found (may have been dropped already)");
    }

    // Drop the column
    await dbp.query(`
      ALTER TABLE programs 
      DROP COLUMN parent_program_id
    `);
    console.log("✅ Dropped parent_program_id column");

    console.log("✅ Successfully dropped parent_program_id column from programs table!");

  } catch (err) {
    console.error("❌ Error dropping parent_program_id column:", err);
    throw err;
  } finally {
    db.end();
  }
}

// Run the script
dropParentProgramId()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
  });


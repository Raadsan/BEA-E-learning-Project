// database/update_programs_schema.js
// Update programs table: add status column and remove sub_programs column
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function updateProgramsSchema() {
  try {
    console.log("🔄 Updating programs table schema...");

    // Check if status column exists
    const [statusCheck] = await dbp.query(
      `SELECT COUNT(*) as count 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'programs' 
       AND COLUMN_NAME = 'status'`,
      [process.env.DB_NAME]
    );

    if (statusCheck[0].count === 0) {
      // Add status column
      await dbp.query(
        `ALTER TABLE programs 
         ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'`
      );
      console.log("✅ Added status column");

      // Set all existing programs to 'active' by default
      await dbp.query(
        `UPDATE programs SET status = 'active' WHERE status IS NULL`
      );
      console.log("✅ Set existing programs to 'active' status");
    } else {
      console.log("ℹ️  status column already exists");
    }

    // Check if sub_programs column exists
    const [subProgramsCheck] = await dbp.query(
      `SELECT COUNT(*) as count 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'programs' 
       AND COLUMN_NAME = 'sub_programs'`,
      [process.env.DB_NAME]
    );

    if (subProgramsCheck[0].count > 0) {
      // Drop sub_programs column
      await dbp.query(`ALTER TABLE programs DROP COLUMN sub_programs`);
      console.log("✅ Removed sub_programs column");
    } else {
      console.log("ℹ️  sub_programs column does not exist");
    }

    console.log("\n✅ Programs table schema updated successfully!");
    console.log("   - status: ENUM('active', 'inactive') DEFAULT 'active'");
    console.log("   - sub_programs: REMOVED");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating programs schema:", err);
    process.exit(1);
  }
}

updateProgramsSchema();


// database/remove_fullname_from_admins.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function removeFullNameColumn() {
  try {
    console.log("🔄 Removing full_name column from admins table...");

    // Check if full_name column exists
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admins'
      AND COLUMN_NAME = 'full_name'
    `);

    if (columns.length > 0) {
      // Drop the full_name column
      await dbp.query(`ALTER TABLE admins DROP COLUMN full_name`);
      console.log("✅ Removed full_name column from admins table");
    } else {
      console.log("ℹ️  full_name column does not exist (already removed)");
    }

    console.log("\n✅ Admins table cleanup completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error removing full_name column:", err);
    process.exit(1);
  }
}

removeFullNameColumn();





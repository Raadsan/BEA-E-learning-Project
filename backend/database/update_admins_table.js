// database/update_admins_table.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function updateAdminsTable() {
  try {
    console.log("🔄 Updating admins table structure...");

    // Check if columns exist, if not add them
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admins'
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Add first_name if it doesn't exist
    if (!existingColumns.includes('first_name')) {
      await dbp.query(`
        ALTER TABLE admins 
        ADD COLUMN first_name VARCHAR(255) AFTER id
      `);
      console.log("✅ Added first_name column");
    }

    // Add last_name if it doesn't exist
    if (!existingColumns.includes('last_name')) {
      await dbp.query(`
        ALTER TABLE admins 
        ADD COLUMN last_name VARCHAR(255) AFTER first_name
      `);
      console.log("✅ Added last_name column");
    }

    // Add phone if it doesn't exist
    if (!existingColumns.includes('phone')) {
      await dbp.query(`
        ALTER TABLE admins 
        ADD COLUMN phone VARCHAR(50) AFTER email
      `);
      console.log("✅ Added phone column");
    }

    // Add status if it doesn't exist
    if (!existingColumns.includes('status')) {
      await dbp.query(`
        ALTER TABLE admins 
        ADD COLUMN status VARCHAR(50) DEFAULT 'active' AFTER role
      `);
      console.log("✅ Added status column");
    }

    // Update existing records: split full_name into first_name and last_name if full_name exists
    if (existingColumns.includes('full_name') && existingColumns.includes('first_name')) {
      await dbp.query(`
        UPDATE admins 
        SET first_name = SUBSTRING_INDEX(full_name, ' ', 1),
            last_name = SUBSTRING_INDEX(full_name, ' ', -1)
        WHERE first_name IS NULL OR first_name = ''
      `);
      console.log("✅ Updated existing records: split full_name into first_name and last_name");
    }

    // Note: We keep password column for now (for login), but won't require it in registration
    // If you want to remove password completely, uncomment below:
    // if (existingColumns.includes('password')) {
    //   await dbp.query(`ALTER TABLE admins DROP COLUMN password`);
    //   console.log("✅ Removed password column");
    // }

    console.log("\n✅ Admins table update completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating admins table:", err);
    process.exit(1);
  }
}

updateAdminsTable();



// add_approval_status_to_students.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addApprovalStatus() {
  try {
    // Check if column already exists
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'approval_status'
    `);
    
    if (columns.length > 0) {
      console.log("ℹ️ approval_status column already exists");
      return;
    }
    
    // Add approval_status column
    await dbp.query(`
      ALTER TABLE students 
      ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') 
      DEFAULT 'pending'
    `);
    
    console.log("✅ approval_status column added to students table");
  } catch (error) {
    // If column already exists, that's fine
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️ approval_status column already exists");
    } else {
      console.error("❌ Error adding approval_status:", error);
      throw error;
    }
  }
}

// Run the migration
addApprovalStatus()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });


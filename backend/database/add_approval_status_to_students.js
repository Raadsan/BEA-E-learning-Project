// add_approval_status_to_students.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addApprovalStatus() {
  try {
    // Add approval_status column if it doesn't exist
    await dbp.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') 
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


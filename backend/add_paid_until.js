import db from "./database/dbconfig.js";

const dbp = db.promise();

async function addPaidUntilColumn() {
  try {
    console.log("Adding paid_until column to students table...");
    // Simpler syntax for better compatibility
    await dbp.query(`
      ALTER TABLE students 
      ADD COLUMN paid_until DATE NULL AFTER sponsor_name
    `);
    console.log("✅ Column added successfully.");

    console.log("Updating existing students with a grace period...");
    await dbp.query(`
      UPDATE students 
      SET paid_until = DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) 
      WHERE paid_until IS NULL AND approval_status = 'approved'
    `);
    console.log("✅ Grace period set for existing approved students.");

    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("ℹ️ Column already exists, skipping addition.");
      process.exit(0);
    }
    console.error("❌ Error adding column:", error);
    process.exit(1);
  }
}

addPaidUntilColumn();

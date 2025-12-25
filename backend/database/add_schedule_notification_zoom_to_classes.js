// add_schedule_notification_zoom_to_classes.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function addFieldsToClasses() {
  try {
    console.log("🔄 Adding schedule, notification, zoom_link fields to classes table...");

    // Add schedule column if it doesn't exist
    try {
      await dbp.query(`ALTER TABLE classes ADD COLUMN schedule VARCHAR(255) NULL`);
      console.log("✅ Added schedule column");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("✅ schedule column already exists");
      } else {
        throw error;
      }
    }

    // Add notification column
    try {
      await dbp.query(`ALTER TABLE classes ADD COLUMN notification TEXT NULL`);
      console.log("✅ Added notification column");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("✅ notification column already exists");
      } else {
        throw error;
      }
    }

    // Add zoom_link column
    try {
      await dbp.query(`ALTER TABLE classes ADD COLUMN zoom_link VARCHAR(500) NULL`);
      console.log("✅ Added zoom_link column");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("✅ zoom_link column already exists");
      } else {
        throw error;
      }
    }

    console.log("✅ Successfully added fields to classes table!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error adding fields:", err);
    process.exit(1);
  }
}

addFieldsToClasses();
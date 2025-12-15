import db from "../database/dbconfig.js";

const addResetColumns = async () => {
  const tables = ["students", "teachers", "admins"];
  
  console.log("🔄 Adding reset password columns to tables...");

  for (const table of tables) {
    try {
      // Check if columns exist
      const [columns] = await db.promise().query(`SHOW COLUMNS FROM ${table} LIKE 'reset_password_token'`);
      
      if (columns.length === 0) {
        await db.promise().query(`
          ALTER TABLE ${table}
          ADD COLUMN reset_password_token VARCHAR(255) NULL,
          ADD COLUMN reset_password_expires DATETIME NULL
        `);
        console.log(`✅ Added columns to ${table}`);
      } else {
        console.log(`ℹ️ Columns already exist in ${table}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${table}:`, err.message);
    }
  }

  console.log("🎉 Database update complete!");
  process.exit();
};

addResetColumns();

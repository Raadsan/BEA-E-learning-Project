// database/add_sub_programs_json_column.js
// Add sub_programs JSON column to programs table
import db from "./dbconfig.js";

const dbp = db.promise();

async function addSubProgramsColumn() {
  try {
    console.log("🔄 Adding sub_programs JSON column to programs table...");

    // Check if column already exists
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'programs' 
      AND COLUMN_NAME = 'sub_programs'
    `);

    if (columns.length > 0) {
      console.log("ℹ️  sub_programs column already exists");
      process.exit(0);
    }

    // Add sub_programs JSON column
    await dbp.query(`
      ALTER TABLE programs 
      ADD COLUMN sub_programs JSON DEFAULT ('[]')
    `);
    console.log("✅ Added sub_programs JSON column");

    // Update existing programs to have empty array if NULL
    await dbp.query(`
      UPDATE programs 
      SET sub_programs = '[]' 
      WHERE sub_programs IS NULL
    `);
    console.log("✅ Initialized existing programs with empty sub_programs array");

    console.log("\n✅ Migration complete!");
    console.log("📝 Structure:");
    console.log("   - sub_programs: JSON column storing array of sub-program objects");
    console.log("   - Each sub-program: { name, image, overview, learningObjectives, skillsDeveloped, outcomes }");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error adding sub_programs column:", err);
    process.exit(1);
  }
}

addSubProgramsColumn();


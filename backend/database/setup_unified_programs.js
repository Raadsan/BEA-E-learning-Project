// database/setup_unified_programs.js
// Setup unified programs table structure
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function setupUnifiedPrograms() {
  try {
    console.log("🔄 Setting up unified programs structure...");

    // Check if columns already exist
    const [columns] = await dbp.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'programs' 
      AND COLUMN_NAME IN ('parent_program_id', 'program_type')
    `);

    const hasParentId = columns.some(col => col.COLUMN_NAME === 'parent_program_id');
    const hasType = columns.some(col => col.COLUMN_NAME === 'program_type');

    // Add parent_program_id if it doesn't exist
    if (!hasParentId) {
      await dbp.query(`
        ALTER TABLE programs 
        ADD COLUMN parent_program_id INT NULL
      `);
      console.log("✅ Added parent_program_id column");
    }

    // Add program_type if it doesn't exist
    if (!hasType) {
      await dbp.query(`
        ALTER TABLE programs 
        ADD COLUMN program_type ENUM('main', 'sub') DEFAULT 'main'
      `);
      console.log("✅ Added program_type column");
    }

    // Add foreign key constraint if it doesn't exist
    try {
      await dbp.query(`
        ALTER TABLE programs 
        ADD CONSTRAINT fk_parent_program 
        FOREIGN KEY (parent_program_id) REFERENCES programs(id) ON DELETE CASCADE
      `);
      console.log("✅ Added foreign key constraint");
    } catch (err) {
      if (err.code !== 'ER_DUP_KEY') {
        throw err;
      }
      console.log("ℹ️  Foreign key already exists");
    }

    // Add indexes
    try {
      await dbp.query(`
        ALTER TABLE programs 
        ADD INDEX idx_parent_program_id (parent_program_id)
      `);
      console.log("✅ Added index for parent_program_id");
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        throw err;
      }
      console.log("ℹ️  Index already exists");
    }

    try {
      await dbp.query(`
        ALTER TABLE programs 
        ADD INDEX idx_program_type (program_type)
      `);
      console.log("✅ Added index for program_type");
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        throw err;
      }
      console.log("ℹ️  Index already exists");
    }

    // Update existing programs to be 'main' type
    await dbp.query(`
      UPDATE programs 
      SET program_type = 'main' 
      WHERE program_type IS NULL OR program_type = ''
    `);
    console.log("✅ Updated existing programs to 'main' type");

    // Update students table to remove sub_program_id dependency on sub_programs table
    // (Keep sub_program_id but it will reference programs table now)
    console.log("✅ Unified programs structure ready!");
    console.log("\n📝 Structure:");
    console.log("   - Main programs: parent_program_id = NULL, program_type = 'main'");
    console.log("   - Sub-programs: parent_program_id = main_program_id, program_type = 'sub'");
    console.log("   - Students can reference ANY program (main or sub) via program_id");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting up unified programs:", err);
    process.exit(1);
  }
}

setupUnifiedPrograms();


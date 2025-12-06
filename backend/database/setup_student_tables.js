// database/setup_student_tables.js
// Run this script to create the student registration tables
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function setupStudentTables() {
  try {
    // Read SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, "create_student_tables.sql"),
      "utf8"
    );

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await dbp.query(statement);
      }
    }

    console.log("✅ Student registration tables created successfully!");
    console.log("   - sub_programs table");
    console.log("   - students table");
    console.log("   - parents table");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating student tables:", err);
    process.exit(1);
  }
}

setupStudentTables();


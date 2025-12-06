// database/setup_contacts.js
// Run this script to create the contacts table
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function setupContactsTable() {
  try {
    // Read SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, "create_contacts_table.sql"),
      "utf8"
    );

    // Execute SQL
    await dbp.query(sql);

    console.log("✅ Contacts table created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating contacts table:", err);
    process.exit(1);
  }
}

setupContactsTable();


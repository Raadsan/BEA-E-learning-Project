import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function createAnnouncementsTable() {
    try {
        console.log("🔄 Creating announcements table...");

        const sqlPath = path.join(__dirname, "create_announcements_table.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        await dbp.query(sql);
        console.log("✅ Created announcements table");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating announcements table:", err);
        process.exit(1);
    }
}

createAnnouncementsTable();

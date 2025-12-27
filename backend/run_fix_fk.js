// backend/run_fix_fk.js
import db from "./database/dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const dbp = db.promise();

async function fixFk() {
    try {
        console.log("🔄 Fixing subprogram foreign key...");
        const sqlPath = path.join(__dirname, "database", "fix_subprogram_fk.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");
        const statements = sql.split(";").filter(st => st.trim() !== "");
        for (const statement of statements) {
            await dbp.query(statement);
        }
        console.log("✅ Fixed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error fixing foreign key:", err);
        process.exit(1);
    }
}

fixFk();

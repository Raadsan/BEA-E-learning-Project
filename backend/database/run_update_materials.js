// database/update_learning_materials.js
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const dbp = db.promise();

async function updateLearningMaterials() {
    try {
        console.log("🔄 Updating learning_materials table...");

        const sqlPath = path.join(__dirname, "update_learning_materials_schema.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        const statements = sql.split(";").filter(st => st.trim() !== "");

        for (const statement of statements) {
            await dbp.query(statement);
        }

        console.log("✅ learning_materials table updated successfully!");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️ Columns already exist.");
            process.exit(0);
        }
        console.error("❌ Error updating materials table:", err);
        process.exit(1);
    }
}

updateLearningMaterials();

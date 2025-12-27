// database/setup_learning_materials.js
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const dbp = db.promise();

async function setupLearningMaterials() {
    try {
        console.log("🔄 Setting up learning_materials table...");

        const sqlPath = path.join(__dirname, "create_learning_materials_table.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        // Split by semicolon for multiple statements if needed
        const statements = sql.split(";").filter(st => st.trim() !== "");

        for (const statement of statements) {
            await dbp.query(statement);
        }

        console.log("✅ learning_materials table created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up materials table:", err);
        process.exit(1);
    }
}

setupLearningMaterials();

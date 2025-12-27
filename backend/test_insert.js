// backend/test_insert.js
import db from "./database/dbconfig.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const dbp = db.promise();

async function test() {
    try {
        const materialData = {
            title: "Test Material",
            type: "Drive",
            program_id: null,
            subprogram_id: null,
            level: "A1",
            subject: "Test Subject",
            description: "Test Description",
            url: "https://google.com",
            status: "Active"
        };

        console.log("Attempting to insert:", materialData);

        const [result] = await dbp.query(
            `INSERT INTO learning_materials (title, type, program_id, subprogram_id, level, subject, description, url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                materialData.title,
                materialData.type,
                materialData.program_id,
                materialData.subprogram_id,
                materialData.level,
                materialData.subject,
                materialData.description,
                materialData.url,
                materialData.status
            ]
        );

        console.log("✅ Insert successful!", result);
        process.exit(0);
    } catch (err) {
        console.error("❌ Insert failed!");
        console.error(err);
        process.exit(1);
    }
}

test();

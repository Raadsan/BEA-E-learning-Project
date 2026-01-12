
import db from "./dbconfig.js";
import fs from "fs";
import path from "path";

const dbp = db.promise();
const artifactPath = "C:\\Users\\Raadsan Tech\\.gemini\\antigravity\\brain\\464f053b-2eaa-44e5-99be-08135c643bb3\\db_inspection.md";

async function inspect() {
    try {
        let output = "# Database Inspection\n\n";
        const tables = ['students', 'classes', 'session_change_requests', 'shifts', 'payments'];

        for (const table of tables) {
            output += `## Table: ${table}\n\n`;
            try {
                const [cols] = await dbp.query(`DESCRIBE ${table}`);
                output += "| Field | Type | Null | Key | Default | Extra |\n";
                output += "|-------|------|------|-----|---------|-------|\n";
                cols.forEach(c => {
                    output += `| ${c.Field} | ${c.Type} | ${c.Null} | ${c.Key} | ${c.Default} | ${c.Extra} |\n`;
                });
                output += "\n";
            } catch (e) {
                output += `Error describing ${table}: ${e.message}\n\n`;
            }
        }

        fs.writeFileSync(artifactPath, output);
        console.log(`✅ Inspection completed. Results written to ${artifactPath}`);
        process.exit(0);
    } catch (error) {
        console.error("Error during inspection:", error);
        process.exit(1);
    }
}

inspect();

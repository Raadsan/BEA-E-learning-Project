
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const { default: db } = await import("./dbconfig.js");
const dbp = db.promise();
const artifactPath = "C:\\Users\\Raadsan Tech\\.gemini\\antigravity\\brain\\d813b5ff-61fd-4433-90e0-64792fba00bc\\db_inspection.md";

async function inspect() {
    try {
        let output = "# Database Inspection\n\n";
        const tables = ['course_work_submissions'];

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

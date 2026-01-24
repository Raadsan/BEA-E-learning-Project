import db from "./database/dbconfig.js";
import fs from "fs";

async function dumpSchema() {
    const dbp = db.promise();
    const tables = ['tests', 'test_submissions', 'students', 'classes', 'subprograms', 'programs', 'teachers'];
    let output = '';

    for (const table of tables) {
        try {
            output += `\n--- Schema for table: ${table} ---\n`;
            const [columns] = await dbp.query(`DESCRIBE ${table}`);
            output += JSON.stringify(columns, null, 2) + '\n';
        } catch (err) {
            output += `Error describing table ${table}: ${err.message}\n`;
        }
    }
    fs.writeFileSync('schema_dump.json', output);
    console.log("Schema dumped to schema_dump.json");
    process.exit(0);
}

dumpSchema();


import db from "./database/dbconfig.js";
import fs from "fs";

const queries = [
    "DESCRIBE users",
    "SELECT * FROM users LIMIT 1"
];

async function run() {
    const dbp = db.promise();
    let output = "";
    for (const q of queries) {
        output += `--- ${q} ---\n`;
        const [rows] = await dbp.query(q);
        output += JSON.stringify(rows, null, 2) + "\n\n";
    }
    fs.appendFileSync("schema_output.txt", output);
    process.exit(0);
}

run();

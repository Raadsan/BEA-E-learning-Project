
import db from "./database/dbconfig.js";
import fs from "fs";

async function check() {
    const dbp = db.promise();
    try {
        const [c] = await dbp.query("DESCRIBE classes");
        const [s] = await dbp.query("DESCRIBE subprograms");
        const out = { classes: c, subprograms: s };
        fs.writeFileSync("schema_check.json", JSON.stringify(out, null, 2));
        process.exit(0);
    } catch (e) {
        fs.writeFileSync("schema_check.json", e.stack);
        process.exit(1);
    }
}
check();

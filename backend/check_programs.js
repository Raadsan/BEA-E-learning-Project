
import db from "./database/dbconfig.js";
import fs from "fs";

async function check() {
    const dbp = db.promise();
    try {
        const [p] = await dbp.query("DESCRIBE programs");
        fs.writeFileSync("programs_schema.json", JSON.stringify(p, null, 2));
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
check();

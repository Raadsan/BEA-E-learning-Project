
import db from "./database/dbconfig.js";
import fs from "fs";

async function verify() {
    const dbp = db.promise();
    try {
        const [rows] = await dbp.query("DESCRIBE ielts_toefl_students");
        fs.writeFileSync("ielts_schema.json", JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
verify();

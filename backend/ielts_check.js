
import db from "./database/dbconfig.js";
import fs from "fs";

async function check() {
    const dbp = db.promise();
    try {
        const [rows] = await dbp.query("SELECT * FROM IELTSTOEFL LIMIT 1");
        fs.writeFileSync("ielts_sample.json", JSON.stringify(rows[0], null, 2));
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
check();

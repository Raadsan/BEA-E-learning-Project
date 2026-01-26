
import db from "./database/dbconfig.js";
import fs from "fs";

async function check() {
    const dbp = db.promise();
    try {
        const studentId = "BEA-ST-GEP-231225-102";
        const [rows] = await dbp.query("SELECT * FROM students WHERE student_id = ?", [studentId]);
        fs.writeFileSync("muzamil_profile.json", JSON.stringify(rows[0], null, 2));
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
check();

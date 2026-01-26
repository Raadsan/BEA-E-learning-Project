
import db from "./database/dbconfig.js";
import fs from "fs";

async function verify() {
    const dbp = db.promise();
    try {
        let out = "";
        const [students] = await dbp.query("SELECT student_id, full_name, email, class_id FROM students WHERE class_id IS NOT NULL LIMIT 20");
        out += "--- Students with Classes ---\n" + JSON.stringify(students, null, 2) + "\n\n";

        const [history] = await dbp.query("SELECT * FROM student_class_history LIMIT 20");
        out += "--- History ---\n" + JSON.stringify(history, null, 2) + "\n";

        fs.writeFileSync("verify_results.json", out);
        process.exit(0);
    } catch (e) {
        fs.writeFileSync("verify_results.json", e.stack);
        process.exit(1);
    }
}
verify();

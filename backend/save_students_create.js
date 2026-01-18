
import db from "./database/dbconfig.js";
import fs from 'fs';
const dbp = db.promise();
async function run() {
    try {
        const [rows] = await dbp.query("SHOW CREATE TABLE students");
        fs.writeFileSync('students_create.sql', rows[0]['Create Table']);
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
run();

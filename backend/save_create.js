
import db from "./database/dbconfig.js";
import fs from 'fs';
const dbp = db.promise();
async function run() {
    try {
        const [rows] = await dbp.query("SHOW CREATE TABLE payments");
        fs.writeFileSync('payments_create.sql', rows[0]['Create Table']);
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
run();

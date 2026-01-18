
import db from "./database/dbconfig.js";
const dbp = db.promise();
async function check() {
    try {
        const [rows] = await dbp.query("DESCRIBE professional_tests");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error("Table professional_tests likely does not exist.");
        process.exit(1);
    }
}
check();


import db from "./backend/database/dbconfig.js";
const dbp = db.promise();
async function check() {
    try {
        const [rows] = await dbp.query("DESCRIBE payments");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();

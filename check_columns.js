
import db from "./backend/database/dbconfig.js";
const dbp = db.promise();
async function check() {
    try {
        const [columns] = await dbp.query("SHOW COLUMNS FROM IELTSTOEFL");
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();

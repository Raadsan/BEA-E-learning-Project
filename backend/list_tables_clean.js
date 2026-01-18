
import db from "./database/dbconfig.js";
const dbp = db.promise();
async function check() {
    try {
        const [rows] = await dbp.query("SHOW TABLES");
        const tables = rows.map(r => Object.values(r)[0]);
        console.log("TABLES FOUND:");
        console.log(tables.join('\n'));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();

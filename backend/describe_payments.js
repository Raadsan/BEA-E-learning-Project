
import db from "./database/dbconfig.js";
const dbp = db.promise();
async function check() {
    try {
        const [rows] = await dbp.query("DESCRIBE payments");
        console.log("PAYMENTS TABLE STRUCTURE:");
        console.log(JSON.stringify(rows, null, 2));

        const [rows2] = await dbp.query("SHOW CREATE TABLE payments");
        console.log("CREATE TABLE PAYMENTS:");
        console.log(rows2[0]['Create Table']);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();

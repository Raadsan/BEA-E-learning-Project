
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
import db from "./dbconfig.js";
const dbp = db.promise();

async function checkNotifications() {
    try {
        console.log("--- Latest 5 notifications ---");
        const [rows] = await dbp.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5");
        console.log(JSON.stringify(rows, null, 2));

        console.log("--- Column Types ---");
        const [cols] = await dbp.query("SHOW COLUMNS FROM notifications");
        console.table(cols);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkNotifications();

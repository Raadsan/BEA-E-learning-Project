import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
import db from "./dbconfig.js";
const dbp = db.promise();

async function checkSchema() {
    try {
        console.log("--- notifications table columns ---");
        const [notifCols] = await dbp.query("SHOW COLUMNS FROM notifications");
        console.table(notifCols);

        console.log("--- session_change_requests table columns ---");
        const [reqCols] = await dbp.query("SHOW COLUMNS FROM session_change_requests");
        console.table(reqCols);

        console.log("--- students table columns ---");
        const [studentCols] = await dbp.query("SHOW COLUMNS FROM students");
        console.table(studentCols);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();

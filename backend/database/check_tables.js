// database/check_tables.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function checkTables() {
    try {
        console.log("Connect to:", process.env.DB_NAME);
        const [rows] = await dbp.query("SHOW TABLES");
        console.log("Tables in database:", rows);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkTables();

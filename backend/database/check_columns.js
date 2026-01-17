import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const dbp = db.promise();

async function checkColumns() {
    try {
        console.log("🔍 Checking columns in attendance table...");
        const [rows] = await dbp.query(`SHOW COLUMNS FROM attendance`);

        const columns = rows.map(r => r.Field);
        console.log("Existing columns:", columns);

        const hasExcused = columns.includes('excused');
        const hasExcuse = columns.includes('excuse');

        console.log(`Has 'excused' (my addition): ${hasExcused}`);
        console.log(`Has 'excuse' (user request): ${hasExcuse}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error checking schema:", err);
        process.exit(1);
    }
}

checkColumns();

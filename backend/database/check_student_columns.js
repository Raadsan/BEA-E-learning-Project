import db from "./dbconfig.js";

const dbp = db.promise();

async function checkColumns() {
    try {
        const [rows] = await dbp.query("SHOW COLUMNS FROM students");
        console.log("Columns in students table:");
        rows.forEach(row => console.log(`- ${row.Field} (${row.Type})`));
        process.exit(0);
    } catch (error) {
        console.error("Error checking columns:", error);
        process.exit(1);
    }
}

checkColumns();

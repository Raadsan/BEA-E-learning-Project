import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        const [rows] = await dbp.query("SHOW TABLES");
        const tables = rows.map(r => Object.values(r)[0]);
        console.log("Full table list:");
        console.log(JSON.stringify(tables, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

import db from "../database/dbconfig.js";

const dbp = db.promise();

async function verify() {
    try {
        console.log("Checking tables...");
        const [tables] = await dbp.query("SHOW TABLES LIKE '%reviews%'");
        console.log("Tables found:", tables.map(t => Object.values(t)[0]));

        if (tables.length > 0) {
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                const [count] = await dbp.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                console.log(`Count in ${tableName}:`, count[0].count);
            }
        } else {
            console.log("No review tables found!");
        }
    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        process.exit();
    }
}

verify();

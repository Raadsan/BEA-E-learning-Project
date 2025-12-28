import db from './dbconfig.js';

async function checkSubprograms() {
    const [rows] = await db.promise().query("SELECT * FROM subprograms");
    console.log("ALL SUBPROGRAMS:");
    console.table(rows);
    process.exit();
}

checkSubprograms();

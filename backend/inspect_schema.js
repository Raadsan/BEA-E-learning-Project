import db from "./database/dbconfig.js";

const tables = ["tests", "programs", "subprograms", "classes"];

for (const table of tables) {
    try {
        const [rows] = await db.promise().query(`DESCRIBE ${table}`);
        console.log(`JSON_START_${table}_${JSON.stringify(rows)}_JSON_END`);
    } catch (e) {
        console.log(`ERROR_${table}_${e.message}`);
    }
}

process.exit();

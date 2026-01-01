import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        console.log("Checking all foreign key dependencies on students table...");
        const [fks] = await dbp.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'students' AND TABLE_SCHEMA = DATABASE()
        `);
        console.log(JSON.stringify(fks, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

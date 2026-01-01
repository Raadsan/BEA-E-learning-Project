import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        console.log("Checking foreign key dependencies on IELTSTOEFL table...");
        const [fks] = await dbp.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'IELTSTOEFL'
        `);
        console.table(fks);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

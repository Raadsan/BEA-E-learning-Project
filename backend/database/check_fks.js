import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        console.log("Checking columns for students table...");
        const [students] = await dbp.query("DESCRIBE students");
        students.slice(0, 5).forEach(col => {
            console.log(`Column: ${col.Field}, Type: ${col.Type}, Key: ${col.Key}, Extra: ${col.Extra}`);
        });

        console.log("\nChecking columns for IELTSTOEFL table...");
        const [ielts] = await dbp.query("DESCRIBE IELTSTOEFL");
        ielts.slice(0, 5).forEach(col => {
            console.log(`Column: ${col.Field}, Type: ${col.Type}, Key: ${col.Key}, Extra: ${col.Extra}`);
        });

        console.log("\nChecking foreign key dependencies on students table...");
        const [fks] = await dbp.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'students'
        `);
        console.table(fks);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

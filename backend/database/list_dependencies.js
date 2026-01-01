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

        console.log("Found foreign keys:");
        fks.forEach(fk => {
            console.log(`Table: ${fk.TABLE_NAME}, Column: ${fk.COLUMN_NAME}, Constraint: ${fk.CONSTRAINT_NAME}`);
        });

        console.log("\nChecking other tables for columns likely to be student IDs but without FKs...");
        const [cols] = await dbp.query(`
            SELECT TABLE_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE COLUMN_NAME LIKE 'student_id%' AND TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME != 'students'
        `);
        cols.forEach(col => {
            console.log(`Potential Column - Table: ${col.TABLE_NAME}, Column: ${col.COLUMN_NAME}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

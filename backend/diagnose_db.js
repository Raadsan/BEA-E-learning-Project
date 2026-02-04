
import db from "./database/dbconfig.js";

const dbp = db.promise();

async function diagnose() {
    try {
        const [tables] = await dbp.query("SHOW TABLES");
        console.log("Database Tables:");
        console.log(JSON.stringify(tables, null, 2));

        // Look for history or enrollment tables
        const potentialTables = tables
            .map(t => Object.values(t)[0])
            .filter(name =>
                name.includes('history') ||
                name.includes('enroll') ||
                name.includes('log') ||
                name.includes('progress') ||
                name.includes('subprogram') ||
                name.includes('level')
            );

        console.log("\nPotential History Tables:", potentialTables);

        if (potentialTables.length > 0) {
            for (const table of potentialTables) {
                const [cols] = await dbp.query(`DESCRIBE \`${table}\``);
                console.log(`\nSchema for ${table}:`, cols.map(c => c.Field));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();

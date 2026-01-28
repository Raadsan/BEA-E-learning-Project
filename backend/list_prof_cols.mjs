import db from './database/dbconfig.js';
const dbp = db.promise();

async function check() {
    const [cols] = await dbp.query("SHOW COLUMNS FROM proficiency_test_results");
    console.log(cols.map(c => c.Field));
    process.exit(0);
}
check();

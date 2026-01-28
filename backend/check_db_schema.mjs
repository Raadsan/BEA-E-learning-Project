import db from './database/dbconfig.js';
const dbp = db.promise();

async function checkSchema() {
    try {
        const [placement] = await dbp.query("DESCRIBE placement_test_results");
        console.log('--- placement_test_results ---');
        console.table(placement);

        const [proficiency] = await dbp.query("DESCRIBE proficiency_test_results");
        console.log('\n--- proficiency_test_results ---');
        console.table(proficiency);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkSchema();

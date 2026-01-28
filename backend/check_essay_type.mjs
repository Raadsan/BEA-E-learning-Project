import db from './database/dbconfig.js';
const dbp = db.promise();

async function checkSchema() {
    try {
        const [placement] = await dbp.query("DESCRIBE placement_test_results 'essay_marks'");
        console.log('Placement Essay Marks:', placement[0].Type);

        const [proficiency] = await dbp.query("DESCRIBE proficiency_test_results 'essay_marks'");
        console.log('Proficiency Essay Marks:', proficiency[0].Type);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkSchema();

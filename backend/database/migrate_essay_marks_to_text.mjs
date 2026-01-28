import db from './dbconfig.js';
const dbp = db.promise();

async function migrate() {
    try {
        console.log('🔧 Updating placement_test_results...');
        // placement_test_results already has essay_marks, so we MODIFY it
        await dbp.query(`ALTER TABLE placement_test_results MODIFY COLUMN essay_marks TEXT`);
        console.log('✅ Updated placement_test_results');

        console.log('🔧 Updating proficiency_test_results...');
        // proficiency_test_results DOES NOT have essay_marks, so we ADD it
        // We'll check if it exists first just in case
        const [cols] = await dbp.query("SHOW COLUMNS FROM proficiency_test_results LIKE 'essay_marks'");
        if (cols.length === 0) {
            await dbp.query(`ALTER TABLE proficiency_test_results ADD COLUMN essay_marks TEXT DEFAULT NULL AFTER score`);
            console.log('✅ Added essay_marks to proficiency_test_results');
        } else {
            await dbp.query(`ALTER TABLE proficiency_test_results MODIFY COLUMN essay_marks TEXT`);
            console.log('✅ Modified existing essay_marks in proficiency_test_results');
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
}
migrate();

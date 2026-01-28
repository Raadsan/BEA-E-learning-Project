import db from './dbconfig.js';

const dbp = db.promise();

async function addOralReviewColumn() {
    try {
        console.log('🔧 Adding oral_review_marks column to placement_test_results...');

        // Check if column exists in placement_test_results
        const [placementColumns] = await dbp.query(
            `SHOW COLUMNS FROM placement_test_results LIKE 'oral_review_marks'`
        );

        if (placementColumns.length === 0) {
            await dbp.query(`
                ALTER TABLE placement_test_results 
                ADD COLUMN oral_review_marks DECIMAL(5,2) DEFAULT NULL AFTER essay_marks
            `);
            console.log('✅ Added oral_review_marks to placement_test_results');
        } else {
            console.log('ℹ️  Column oral_review_marks already exists in placement_test_results');
        }

        console.log('🔧 Adding oral_review_marks column to proficiency_test_results...');

        // Check if column exists in proficiency_test_results
        const [proficiencyColumns] = await dbp.query(
            `SHOW COLUMNS FROM proficiency_test_results LIKE 'oral_review_marks'`
        );

        if (proficiencyColumns.length === 0) {
            await dbp.query(`
                ALTER TABLE proficiency_test_results 
                ADD COLUMN oral_review_marks DECIMAL(5,2) DEFAULT NULL AFTER score
            `);
            console.log('✅ Added oral_review_marks to proficiency_test_results');
        } else {
            console.log('ℹ️  Column oral_review_marks already exists in proficiency_test_results');
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addOralReviewColumn();

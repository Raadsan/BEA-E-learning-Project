import db from './dbconfig.js';

const dbp = db.promise();

async function addCompletedSubprogramsColumn() {
    try {
        console.log('🔧 Adding completed_subprograms column to students table...');

        // Check if column already exists
        const [columns] = await dbp.query(`
      SHOW COLUMNS FROM students LIKE 'completed_subprograms'
    `);

        if (columns.length > 0) {
            console.log('✅ Column completed_subprograms already exists');
            return;
        }

        // Add the column
        await dbp.query(`
      ALTER TABLE students 
      ADD COLUMN completed_subprograms TEXT NULL 
      COMMENT 'Comma-separated list of completed subprogram IDs or names'
      AFTER chosen_subprogram
    `);

        console.log('✅ Successfully added completed_subprograms column to students table');

    } catch (error) {
        console.error('❌ Error adding completed_subprograms column:', error);
        throw error;
    } finally {
        process.exit();
    }
}

addCompletedSubprogramsColumn();

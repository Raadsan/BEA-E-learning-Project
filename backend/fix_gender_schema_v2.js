
import db from './database/dbconfig.js';

async function fixSchema() {
    console.log('Using app db configuration...');

    // Use promise wrapper
    const dbp = db.promise();

    try {
        console.log('Checking students table...');
        const [columns] = await dbp.query(`SHOW COLUMNS FROM students LIKE 'gender'`);

        if (columns.length > 0) {
            console.log('✅ Gender column ALREADY EXISTS.');
        } else {
            console.log('⚠️ Gender column missing. Adding it now...');
            await dbp.query(`
                ALTER TABLE students 
                ADD COLUMN gender VARCHAR(20) NULL AFTER age
            `);
            console.log('✅ Gender column added successfully!');
        }

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
    } finally {
        process.exit(0);
    }
}

fixSchema();

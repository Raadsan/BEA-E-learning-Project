import db from './dbconfig.js';

const dbp = db.promise();

async function checkIELTSTable() {
    try {
        console.log('Checking IELTSTOEFL table structure...\n');

        // Check if table exists and get its structure
        const [columns] = await dbp.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'IELTSTOEFL'
            ORDER BY ORDINAL_POSITION
        `);

        console.log('IELTSTOEFL Table Columns:');
        console.table(columns);

        // Also check first row to see actual data
        const [rows] = await dbp.query("SELECT * FROM IELTSTOEFL LIMIT 1");
        console.log('\nSample row from IELTSTOEFL:');
        console.log(rows[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

checkIELTSTable();

import db from './dbconfig.js';

const dbp = db.promise();

async function showIELTSColumns() {
    try {
        // Get all column names
        const [columns] = await dbp.query(`
            SHOW COLUMNS FROM IELTSTOEFL
        `);

        console.log('IELTSTOEFL Table Columns:\n');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

        // Get a sample row to see the data
        console.log('\n\nSample row from IELTSTOEFL:');
        const [rows] = await dbp.query("SELECT * FROM IELTSTOEFL LIMIT 1");
        if (rows.length > 0) {
            Object.keys(rows[0]).forEach(key => {
                console.log(`  ${key}: ${rows[0][key]}`);
            });
        } else {
            console.log('  No data in table');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

showIELTSColumns();

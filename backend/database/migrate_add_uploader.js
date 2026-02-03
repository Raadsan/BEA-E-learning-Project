import db from './dbconfig.js';

async function updateCertificatesTable() {
    try {
        console.log('Adding uploader_id to certificates table...');
        const query = "ALTER TABLE certificates ADD COLUMN uploader_id INT DEFAULT NULL";
        await db.promise().query(query);
        console.log('Column added successfully.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Error updating table:', error);
        process.exit(1);
    }
}

updateCertificatesTable();

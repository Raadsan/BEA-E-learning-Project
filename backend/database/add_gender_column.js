import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addGenderColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Adding gender column to students table...');

        // Add gender column after age column
        await connection.query(`
      ALTER TABLE students 
      ADD COLUMN gender VARCHAR(20) NULL AFTER age
    `);

        console.log('✅ Gender column added successfully!');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Gender column already exists.');
        } else {
            console.error('❌ Error adding gender column:', error.message);
            throw error;
        }
    } finally {
        await connection.end();
    }
}

addGenderColumn()
    .then(() => {
        console.log('Migration completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });

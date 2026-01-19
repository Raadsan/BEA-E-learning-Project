import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beadb',
    port: process.env.DB_PORT || 3306,
};

async function run() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database');

        // Try to query the table directly
        try {
            const [rows] = await connection.query('SELECT * FROM proficiency_test_results LIMIT 1');
            console.log('✓ Table exists! Sample row:', rows[0]);

            // Check current ENUM values
            const [columns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
            console.log('\nCurrent status column definition:', columns[0]);

            // Now ALTER it
            console.log('\nAttempting to ALTER table...');
            await connection.query(`
                ALTER TABLE proficiency_test_results 
                MODIFY COLUMN status ENUM('pending', 'graded', 'reviewed', 'completed') 
                DEFAULT 'pending'
            `);
            console.log('✓ Successfully added "completed" to status ENUM!');

            // Verify
            const [newColumns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
            console.log('\nUpdated status column:', newColumns[0]);

        } catch (e) {
            console.error('Table query failed:', e.message);
        }

    } catch (e) {
        console.error('✗ Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

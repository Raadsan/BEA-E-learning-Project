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
        console.log('✓ Connected to:', dbConfig.host, '- Database:', dbConfig.database);

        // Check current database
        const [db] = await connection.query('SELECT DATABASE()');
        console.log('Current database:', db[0]);

        // Try to find the table
        const [tables] = await connection.query("SHOW TABLES LIKE 'proficiency_test_results'");
        console.log('\nTable exists:', tables.length > 0);

        if (tables.length > 0) {
            // Show current status column
            const [columns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
            console.log('\nCurrent status column:');
            console.log('Type:', columns[0].Type);
            console.log('Default:', columns[0].Default);

            // Check if 'completed' is in the ENUM
            if (columns[0].Type.includes('completed')) {
                console.log('\n✓ "completed" is already in the ENUM!');
            } else {
                console.log('\n✗ "completed" is NOT in the ENUM');
                console.log('Attempting to add it now...');

                await connection.query(`
                    ALTER TABLE proficiency_test_results 
                    MODIFY COLUMN status ENUM('pending', 'graded', 'reviewed', 'completed') 
                    DEFAULT 'pending'
                `);

                console.log('✓ ALTER completed');

                // Verify again
                const [newColumns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
                console.log('\nUpdated Type:', newColumns[0].Type);
            }
        }

    } catch (e) {
        console.error('✗ Error:', e.message);
        console.error('Stack:', e.stack);
    } finally {
        if (connection) await connection.end();
    }
}

run();

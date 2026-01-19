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

        // Check if table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'proficiency_test_results'");
        if (tables.length === 0) {
            console.log('✗ Table proficiency_test_results does not exist');
            return;
        }
        console.log('✓ Table exists');

        // Show current status column
        const [columns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results LIKE 'status'");
        console.log('Current status column:', columns[0]);

        // Update the ENUM
        await connection.query(`
            ALTER TABLE proficiency_test_results 
            MODIFY COLUMN status ENUM('pending', 'graded', 'reviewed', 'completed') 
            DEFAULT 'pending'
        `);

        console.log('✓ Successfully added "completed" to status ENUM');

        // Verify
        const [newColumns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results LIKE 'status'");
        console.log('Updated status column:', newColumns[0]);

    } catch (e) {
        console.error('✗ Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

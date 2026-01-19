import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
};

async function run() {
    let connection;
    try {
        console.log('Connecting to REMOTE database:', dbConfig.host);
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to:', dbConfig.host, '- Database:', dbConfig.database);

        // Check if table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'proficiency_test_results'");
        console.log('\nTable exists:', tables.length > 0);

        if (tables.length > 0) {
            // Show current status column
            const [columns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
            console.log('\nCurrent status column:');
            console.log('Type:', columns[0].Type);

            // Check if 'completed' is in the ENUM
            if (columns[0].Type.includes('completed')) {
                console.log('\n✓ "completed" is ALREADY in the ENUM!');
            } else {
                console.log('\n✗ "completed" is NOT in the ENUM - Adding it now...');

                await connection.query(`
                    ALTER TABLE proficiency_test_results 
                    MODIFY COLUMN status ENUM('pending', 'graded', 'reviewed', 'completed') 
                    DEFAULT 'pending'
                `);

                console.log('✓ ALTER completed successfully!');

                // Verify
                const [newColumns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
                console.log('\nUpdated Type:', newColumns[0].Type);
            }
        } else {
            console.log('✗ Table does not exist on remote database!');
        }

    } catch (e) {
        console.error('✗ Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

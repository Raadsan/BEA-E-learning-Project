import mysql from 'mysql2/promise';

// Direct connection to remote database
const dbConfig = {
    host: 'centerbeam.proxy.rlwy.net',
    port: 11633,
    user: 'root',
    password: 'TitRelhjpHWOHOvjDIVXEJesZfwhkXJB',
    database: 'beadb',
};

async function run() {
    let connection;
    try {
        console.log('Connecting to REMOTE Railway database...');
        console.log('Host:', dbConfig.host);
        console.log('Database:', dbConfig.database);

        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Successfully connected!');

        // Check if table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'proficiency_test_results'");
        console.log('\nTable exists:', tables.length > 0);

        if (tables.length > 0) {
            // Show current status column
            const [columns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
            console.log('\nCurrent status ENUM:');
            console.log(columns[0].Type);

            // Check if 'completed' is in the ENUM
            if (columns[0].Type.includes('completed')) {
                console.log('\n✓ "completed" is ALREADY in the ENUM - No changes needed!');
            } else {
                console.log('\n✗ "completed" is NOT in the ENUM');
                console.log('Adding "completed" to the ENUM now...\n');

                await connection.query(`
                    ALTER TABLE proficiency_test_results 
                    MODIFY COLUMN status ENUM('pending', 'graded', 'reviewed', 'completed') 
                    DEFAULT 'pending'
                `);

                console.log('✓ ALTER TABLE completed successfully!');

                // Verify the change
                const [newColumns] = await connection.query("SHOW COLUMNS FROM proficiency_test_results WHERE Field = 'status'");
                console.log('\n✓ Updated ENUM:');
                console.log(newColumns[0].Type);
                console.log('\n✅ Database is now ready! You can submit grades.');
            }
        } else {
            console.log('\n✗ ERROR: Table "proficiency_test_results" does not exist!');
        }

    } catch (e) {
        console.error('\n✗ Connection/Query Error:', e.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nConnection closed.');
        }
    }
}

run();

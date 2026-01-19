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

        // First, check what tables exist with 'result' in the name
        const [tables] = await connection.query("SHOW TABLES LIKE '%result%'");
        console.log('Tables with "result" in name:', tables);

        // Try to find the actual table
        const [allTables] = await connection.query("SHOW TABLES");
        console.log('\nAll tables:', allTables);

        // Check for proficiency-related tables
        const [profTables] = await connection.query("SHOW TABLES LIKE '%profic%'");
        console.log('\nProficiency tables:', profTables);

    } catch (e) {
        console.error('✗ Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

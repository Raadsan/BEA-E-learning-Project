import { readFileSync } from 'fs';
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
        console.log('Connected to database...');

        const sql = readFileSync('./add_completed_status.sql', 'utf8');
        console.log('Executing SQL:', sql);

        await connection.query(sql);
        console.log('✓ Migration successful - "completed" status added!');
    } catch (e) {
        console.error('✗ Migration failed:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

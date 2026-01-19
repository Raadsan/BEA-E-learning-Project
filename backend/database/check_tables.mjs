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

        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables in database:');
        console.log(tables);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('--- Updating payment_packages schema ---');
        await connection.execute('ALTER TABLE payment_packages MODIFY amount DECIMAL(10,2) NULL');
        console.log('[SUCCESS] Field "amount" is now nullable.');
    } catch (error) {
        console.error('[ERROR] Schema update failed:', error.message);
    } finally {
        await connection.end();
    }
}

updateSchema();

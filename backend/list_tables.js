import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
});

async function listTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables in database:');
        rows.forEach(row => console.log(Object.values(row)[0]));
    } catch (error) {
        console.error('Error listing tables:', error.message);
    }
    await pool.end();
}

listTables();

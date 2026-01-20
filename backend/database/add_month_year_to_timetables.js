import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Adding month and year columns to timetables table...');

        await connection.execute(`
            ALTER TABLE timetables 
            ADD COLUMN month VARCHAR(20) NULL,
            ADD COLUMN year INT NULL
        `);

        console.log('Migration successful!');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN') {
            console.log('Columns already exist, skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
    }
}

migrate();

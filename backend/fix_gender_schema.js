
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix dotenv path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Current directory:', __dirname);
dotenv.config({ path: path.join(__dirname, '.env') });

async function fixSchema() {
    console.log('Attempting to connect with:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
    });

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Checking students table...');
        const [columns] = await connection.query(`SHOW COLUMNS FROM students LIKE 'gender'`);

        if (columns.length > 0) {
            console.log('✅ Gender column ALREADY EXISTS.');
        } else {
            console.log('⚠️ Gender column missing. Adding it now...');
            await connection.query(`
                ALTER TABLE students 
                ADD COLUMN gender VARCHAR(20) NULL AFTER age
            `);
            console.log('✅ Gender column added successfully!');
        }

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
    } finally {
        await connection.end();
    }
}

fixSchema();

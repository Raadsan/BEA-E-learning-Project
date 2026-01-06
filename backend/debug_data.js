
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from current directory (backend)
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bea_db',
};

async function checkData() {
    console.log('Connecting to DB:', dbConfig.database);
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('\n--- Checking Gender Data ---');
        const [students] = await connection.execute('SELECT gender, COUNT(*) as count FROM students GROUP BY gender');
        if (students.length === 0) {
            console.log('No students found in DB.');
        } else {
            console.table(students);
        }

        console.log('\n--- Checking Attendance Data ---');
        const [attendance] = await connection.execute('SELECT COUNT(*) as total_records FROM attendance');
        console.log('Total Attendance Records:', attendance[0].total_records);

        if (attendance[0].total_records > 0) {
            const [recent] = await connection.execute('SELECT * FROM attendance ORDER BY date DESC LIMIT 5');
            console.log('\nRecent 5 Attendance Records:');
            console.table(recent);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkData();

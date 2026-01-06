
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
};

async function fixGender() {
    console.log('Connecting to DB...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('Checking for students with NULL gender...');
        const [rows] = await connection.execute("SELECT student_id FROM students WHERE gender IS NULL OR gender = ''");
        console.log(`Found ${rows.length} students with missing gender.`);

        if (rows.length > 0) {
            console.log('Updating genders...');
            for (const student of rows) {
                // Randomly assign Male or Female
                const gender = Math.random() < 0.5 ? 'Male' : 'Female';
                await connection.execute("UPDATE students SET gender = ? WHERE student_id = ?", [gender, student.student_id]);
            }
            console.log('✅ Successfully updated genders.');
        } else {
            console.log('No students needed updating.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixGender();

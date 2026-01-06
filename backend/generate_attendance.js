
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

async function generateAttendance() {
    console.log('Connecting to DB...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        // Get all students with classes
        const [students] = await connection.execute('SELECT student_id, class_id FROM students WHERE class_id IS NOT NULL');
        console.log(`Found ${students.length} students with classes.`);

        if (students.length === 0) {
            console.log("No students assigned to classes. Cannot generate attendance.");
            return;
        }

        // Generate for last 7 days
        const today = new Date();
        let insertedCount = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (const student of students) {
                // 80% chance of attendance
                const attended = Math.random() < 0.8;
                if (!attended) continue;

                // Check if exists
                const [exists] = await connection.execute(
                    'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
                    [student.student_id, dateStr]
                );

                if (exists.length === 0) {
                    await connection.execute(
                        'INSERT INTO attendance (class_id, student_id, date, hour1, hour2) VALUES (?, ?, ?, ?, ?)',
                        [student.class_id, student.student_id, dateStr, 1, 1]
                    );
                    insertedCount++;
                }
            }
        }

        console.log(`✅ Generated ${insertedCount} attendance records for the last 7 days.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

generateAttendance();

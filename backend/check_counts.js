
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

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [genders] = await connection.execute('SELECT gender, COUNT(*) as c FROM students GROUP BY gender');
        console.log('GENDERS:');
        genders.forEach(r => console.log(`"${r.gender}": ${r.c}`));

        const [att] = await connection.execute('SELECT COUNT(*) as c FROM attendance');
        console.log(`ATTENDANCE_TOTAL: ${att[0].c}`);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        if (connection) await connection.end();
    }
}
check();

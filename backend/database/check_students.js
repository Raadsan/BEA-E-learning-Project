import db from './dbconfig.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
    try {
        const [rows] = await db.promise().query('SELECT full_name, chosen_program, chosen_subprogram, expiry_date FROM students ORDER BY created_at DESC LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

check();

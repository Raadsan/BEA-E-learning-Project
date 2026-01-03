import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTimetablesTable = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'create_timetables_table.sql'), 'utf8');
        await db.promise().query(sql);
        console.log("Timetables table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating timetables table:", err);
        process.exit(1);

    }
};

createTimetablesTable();

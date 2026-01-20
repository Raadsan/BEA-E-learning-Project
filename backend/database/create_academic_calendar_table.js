import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createAcademicCalendarTable = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'create_academic_calendar_table.sql'), 'utf8');
        await db.promise().query(sql);
        console.log("Academic calendar table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating academic calendar table:", err);
        process.exit(1);
    }
};

createAcademicCalendarTable();

import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProficiencyTestResultsTable = async () => {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, '../database/create_proficiency_test_results_table.sql'),
            'utf8'
        );

        await db.promise().query(sql);
        console.log('✅ Proficiency test results table created successfully');
        db.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating proficiency test results table:', error);
        db.end();
        process.exit(1);
    }
};

createProficiencyTestResultsTable();

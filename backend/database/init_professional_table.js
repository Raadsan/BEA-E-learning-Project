import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = async () => {
    try {
        const sqlPath = path.join(__dirname, 'create_professional_test_results_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Running SQL...");
        await db.promise().query(sql);
        console.log("Table 'professional_test_results' created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating table:", error);
        process.exit(1);
    }
};

runScript();

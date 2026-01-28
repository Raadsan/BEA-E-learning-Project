import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function runMigration() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_submission_type_to_oral_assignments.sql'),
            'utf8'
        );

        await dbp.query(sql);
        console.log('✅ Migration completed: submission_type column added to oral_assignments');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();

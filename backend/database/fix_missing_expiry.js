import db from './dbconfig.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fix() {
    try {
        console.log('⏳ Fixing missing expiry dates...');
        // Set expiry_date to 24 hours from created_at for students where it is null and they were created in the last 2 days
        const [result] = await db.promise().query(`
            UPDATE students 
            SET expiry_date = DATE_ADD(created_at, INTERVAL 24 HOUR) 
            WHERE expiry_date IS NULL AND created_at > DATE_SUB(NOW(), INTERVAL 2 DAY)
        `);
        console.log(`✅ Fixed ${result.affectedRows} student records.`);

        // Ensure test durations are correct
        await db.promise().query('UPDATE placement_tests SET duration_minutes = 1440');
        await db.promise().query('UPDATE proficiency_tests SET duration_minutes = 1440');
        console.log('✅ Verified test durations.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

fix();

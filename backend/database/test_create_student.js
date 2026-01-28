import * as Student from './studentModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
    try {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);

        console.log('⏳ Creating test student with expiry:', expiryDate);

        const student = await Student.createStudent({
            full_name: 'Test Student Expiry',
            email: `test_expiry_${Date.now()}@example.com`,
            password: 'password123',
            chosen_program: '8-Level General English Course for Adults',
            expiry_date: expiryDate
        });

        console.log('✅ Created student:', student.full_name);
        console.log('✅ Saved Expiry Date:', student.expiry_date);

        if (!student.expiry_date) {
            console.error('❌ Expiry date is MISSING in the returned object!');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

test();

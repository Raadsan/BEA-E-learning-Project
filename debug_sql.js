import 'dotenv/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './backend/database/dbconfig.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function debug() {
    try {
        const [version] = await db.promise().query('SELECT VERSION()');
        console.log('MySQL Version:', version[0]['VERSION()']);

        const [results] = await db.promise().query(`
            SELECT pay.id, pay.student_id, pay.amount, pay.currency, pay.status, 
                  pay.method as payment_method, pay.created_at as payment_date, 
                  pay.provider_transaction_id, pay.payer_phone,
                  COALESCE(p.title, p2.title, it.chosen_program, s.chosen_program, CAST(pay.program_id AS CHAR), 'Proficiency Test') as program_name,
                  COALESCE(s.full_name, CONCAT(it.first_name, ' ', it.last_name), CONCAT(pto.first_name, ' ', pto.last_name)) as student_name,
                  COALESCE(pay.raw_response, '') as description
            FROM payments pay 
            LEFT JOIN programs p ON (CAST(pay.program_id AS CHAR) = p.id OR CAST(pay.program_id AS CHAR) = p.title)
            LEFT JOIN students s ON pay.student_id = s.student_id
            LEFT JOIN programs p2 ON (s.chosen_program = p2.id OR s.chosen_program = p2.title)
            LEFT JOIN IELTSTOEFL it ON (pay.student_id = it.student_id OR pay.ielts_student_id = it.student_id)
            LEFT JOIN ProficiencyTestOnly pto ON pay.student_id = pto.student_id
            LIMIT 1
        `);
        console.log('Query without COLLATE: Success');
    } catch (err) {
        console.error('Query without COLLATE failed:', err.message);
    }

    try {
        const [results] = await db.promise().query(`
            SELECT pay.id, pay.student_id, pay.amount, pay.currency, pay.status, 
                  pay.method as payment_method, pay.created_at as payment_date, 
                  pay.provider_transaction_id, pay.payer_phone,
                  COALESCE(p.title COLLATE utf8mb4_unicode_ci, p2.title COLLATE utf8mb4_unicode_ci, it.chosen_program COLLATE utf8mb4_unicode_ci, s.chosen_program COLLATE utf8mb4_unicode_ci, CAST(pay.program_id AS CHAR) COLLATE utf8mb4_unicode_ci, 'Proficiency Test') as program_name,
                  COALESCE(s.full_name COLLATE utf8mb4_unicode_ci, CONCAT(it.first_name COLLATE utf8mb4_unicode_ci, ' ', it.last_name COLLATE utf8mb4_unicode_ci), CONCAT(pto.first_name COLLATE utf8mb4_unicode_ci, ' ', pto.last_name COLLATE utf8mb4_unicode_ci)) as student_name,
                  COALESCE(pay.raw_response, '') as description
            FROM payments pay 
            LEFT JOIN programs p ON (CAST(pay.program_id AS CHAR) COLLATE utf8mb4_unicode_ci = p.id OR CAST(pay.program_id AS CHAR) COLLATE utf8mb4_unicode_ci = p.title COLLATE utf8mb4_unicode_ci)
            LEFT JOIN students s ON pay.student_id = s.student_id
            LEFT JOIN programs p2 ON (s.chosen_program COLLATE utf8mb4_unicode_ci = p2.id OR s.chosen_program COLLATE utf8mb4_unicode_ci = p2.title COLLATE utf8mb4_unicode_ci)
            LEFT JOIN IELTSTOEFL it ON (pay.student_id = it.student_id OR pay.ielts_student_id = it.student_id)
            LEFT JOIN ProficiencyTestOnly pto ON pay.student_id = pto.student_id
            LIMIT 1
        `);
        console.log('Query with COLLATE utf8mb4_unicode_ci: Success');
    } catch (err) {
        console.error('Query with COLLATE utf8mb4_unicode_ci failed:', err.message);
    }

    try {
        const [results] = await db.promise().query(`
            SELECT pay.id, pay.student_id, pay.amount, pay.currency, pay.status, 
                  pay.method as payment_method, pay.created_at as payment_date, 
                  pay.provider_transaction_id, pay.payer_phone,
                  COALESCE(p.title COLLATE utf8_bin, p2.title COLLATE utf8_bin, it.chosen_program COLLATE utf8_bin, s.chosen_program COLLATE utf8_bin, CAST(pay.program_id AS CHAR) COLLATE utf8_bin, 'Proficiency Test') as program_name,
                  COALESCE(s.full_name COLLATE utf8_bin, CONCAT(it.first_name COLLATE utf8_bin, ' ', it.last_name COLLATE utf8_bin), CONCAT(pto.first_name COLLATE utf8_bin, ' ', pto.last_name COLLATE utf8_bin)) as student_name,
                  COALESCE(pay.raw_response, '') as description
            FROM payments pay 
            LEFT JOIN programs p ON (CAST(pay.program_id AS CHAR) COLLATE utf8_bin = p.id OR CAST(pay.program_id AS CHAR) COLLATE utf8_bin = p.title COLLATE utf8_bin)
            LEFT JOIN students s ON pay.student_id = s.student_id
            LEFT JOIN programs p2 ON (s.chosen_program COLLATE utf8_bin = p2.id OR s.chosen_program COLLATE utf8_bin = p2.title COLLATE utf8_bin)
            LEFT JOIN IELTSTOEFL it ON (pay.student_id = it.student_id OR pay.ielts_student_id = it.student_id)
            LEFT JOIN ProficiencyTestOnly pto ON pay.student_id = pto.student_id
            LIMIT 1
        `);
        console.log('Query with COLLATE utf8_bin: Success');
    } catch (err) {
        console.error('Query with COLLATE utf8_bin failed:', err.message);
    }

    process.exit(0);
}

debug();

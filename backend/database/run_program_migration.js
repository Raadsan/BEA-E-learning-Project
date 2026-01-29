import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    console.log('✅ Connected to database');

    try {
        const sqlPath = path.join(__dirname, 'add_test_required_to_programs.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await connection.query(sql);
        console.log('✅ Migration successful! Added test_required column to programs table.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ Column test_required already exists, skipping.');
        } else {
            console.error('❌ Migration error:', error);
        }
    } finally {
        await connection.end();
        process.exit(0);
    }
}

runMigration();

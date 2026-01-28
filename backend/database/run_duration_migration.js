import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

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
        const sql = `
            UPDATE placement_tests SET duration_minutes = 1440;
            UPDATE proficiency_tests SET duration_minutes = 1440;
        `;

        await connection.query(sql);
        console.log('✅ Migration successful! Test durations updated to 24 hours (1440 minutes)');
    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

runMigration();

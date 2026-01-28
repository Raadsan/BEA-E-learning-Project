import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    try {
        const sql = `
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS expiry_date DATETIME NULL AFTER scholarship_percentage,
            ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT 0 AFTER expiry_date,
            ADD COLUMN IF NOT EXISTS admin_expiry_notified BOOLEAN DEFAULT 0 AFTER reminder_sent;
        `;

        await connection.query(sql);
        console.log('✅ Migration successful! Expiry columns added to students table.');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMNNAME') {
            console.log('✅ Columns already exist, skipping.');
        } else {
            console.error('❌ Migration error:', error);
        }
    } finally {
        await connection.end();
        process.exit(0);
    }
}

runMigration();

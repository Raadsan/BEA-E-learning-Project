import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

const sql = `ALTER TABLE oral_assignments 
ADD COLUMN submission_type ENUM('audio', 'video', 'both') DEFAULT 'audio' AFTER duration;`;

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }

    console.log('✅ Connected to database');

    connection.query(sql, (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('✅ Column already exists, no migration needed');
            } else {
                console.error('❌ Migration error:', error);
                connection.end();
                process.exit(1);
            }
        } else {
            console.log('✅ Migration successful! submission_type column added');
        }

        connection.end();
        process.exit(0);
    });
});

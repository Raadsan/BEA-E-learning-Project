const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bea_db',
};

async function run() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const sql = fs.readFileSync('./add_completed_status.sql', 'utf8');
        await connection.query(sql);
        console.log("Migration successful");
        await connection.end();
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

run();

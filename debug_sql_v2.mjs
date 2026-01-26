import 'dotenv/config';
import mysql from 'mysql2/promise';

async function debug() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'test',
        port: process.env.DB_PORT || 3306
    };

    console.log('Connecting to:', config.host, ':', config.port, 'db:', config.database);

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected Successfully');

        const [version] = await connection.query('SELECT VERSION()');
        console.log('MySQL Version:', version[0]['VERSION()']);

        const tests = [
            {
                name: 'Without COLLATE',
                sql: `SELECT pay.id FROM payments pay LEFT JOIN programs p ON (CAST(pay.program_id AS CHAR) = p.id OR CAST(pay.program_id AS CHAR) = p.title) LIMIT 1`
            },
            {
                name: 'With COLLATE utf8mb4_unicode_ci',
                sql: `SELECT pay.id FROM payments pay LEFT JOIN programs p ON (CAST(pay.program_id AS CHAR) COLLATE utf8mb4_unicode_ci = p.id OR CAST(pay.program_id AS CHAR) COLLATE utf8mb4_unicode_ci = p.title COLLATE utf8mb4_unicode_ci) LIMIT 1`
            },
            {
                name: 'With COLLATE utf8_general_ci',
                sql: `SELECT pay.id FROM payments pay LEFT JOIN programs p ON (CAST(pay.program_id AS CHAR) COLLATE utf8_general_ci = p.id OR CAST(pay.program_id AS CHAR) COLLATE utf8_general_ci = p.title COLLATE utf8_general_ci) LIMIT 1`
            },
            {
                name: 'With BINARY',
                sql: `SELECT pay.id FROM payments pay LEFT JOIN programs p ON (BINARY CAST(pay.program_id AS CHAR) = BINARY p.id OR BINARY CAST(pay.program_id AS CHAR) = BINARY p.title) LIMIT 1`
            }
        ];

        for (const test of tests) {
            try {
                await connection.query(test.sql);
                console.log(`Test [${test.name}]: SUCCESS`);
            } catch (err) {
                console.log(`Test [${test.name}]: FAILED - ${err.message}`);
            }
        }

    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        if (connection) await connection.end();
    }

    process.exit(0);
}

debug();

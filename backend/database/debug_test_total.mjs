import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbConfig = {
    host: 'centerbeam.proxy.rlwy.net',
    port: 11633,
    user: 'root',
    password: 'TitRelhjpHWOHOvjDIVXEJesZfwhkXJB',
    database: 'beadb',
};

async function run() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database');

        // Get a specific result and its test
        const [results] = await connection.query(`
            SELECT r.*, t.questions, t.title
            FROM proficiency_test_results r
            JOIN proficiency_tests t ON r.test_id = t.id
            WHERE r.score = 63
            LIMIT 1
        `);

        if (results.length === 0) {
            console.log('No result found with score 63');
            return;
        }

        const result = results[0];
        console.log('\n=== Test Info ===');
        console.log('Test Title:', result.title);
        console.log('Student Score:', result.score);
        console.log('Stored Total Points:', result.total_points);

        // Parse and calculate actual total
        const questions = typeof result.questions === 'string'
            ? JSON.parse(result.questions)
            : result.questions;

        let actualTotal = 0;
        console.log('\n=== Question Breakdown ===');

        questions?.forEach((q, i) => {
            console.log(`\nQuestion ${i + 1}:`);
            console.log('  Type:', q.type);
            console.log('  Points:', q.points);

            if (q.type === 'passage') {
                let passageTotal = 0;
                q.subQuestions?.forEach(sq => {
                    const pts = parseInt(sq.points) || 1;
                    passageTotal += pts;
                    console.log(`    Sub-question: ${pts} points`);
                });
                actualTotal += passageTotal;
                console.log(`  Passage Total: ${passageTotal} points`);
            } else {
                const pts = parseInt(q.points) || 1;
                actualTotal += pts;
                console.log(`  Added: ${pts} points`);
            }
        });

        console.log('\n=== TOTALS ===');
        console.log('Calculated Total Points:', actualTotal);
        console.log('Stored Total Points:', result.total_points);
        console.log('Difference:', actualTotal - result.total_points);
        console.log('\nCorrect Score Display:', `${result.score} / ${actualTotal}`);
        console.log('Correct Percentage:', `${Math.round((result.score / actualTotal) * 100)}%`);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

import mysql from 'mysql2/promise';

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
        console.log('✓ Connected to Railway database');

        // Get all results and their questions
        const [results] = await connection.query(`
            SELECT r.id, r.total_points as old_total, t.questions, t.title
            FROM proficiency_test_results r
            JOIN proficiency_tests t ON r.test_id = t.id
        `);

        console.log(`Found ${results.length} results to check.`);

        for (const row of results) {
            let actualTotal = 0;
            try {
                const questions = typeof row.questions === 'string'
                    ? JSON.parse(row.questions)
                    : row.questions;

                questions?.forEach(q => {
                    if (q.type === 'passage') {
                        q.subQuestions?.forEach(sq => {
                            actualTotal += (parseInt(sq.points) || 1);
                        });
                    } else {
                        actualTotal += (parseInt(q.points) || 1);
                    }
                });

                if (actualTotal > 0 && actualTotal !== row.old_total) {
                    console.log(`Updating result ${row.id}: ${row.old_total} -> ${actualTotal} (${row.title})`);
                    await connection.query(
                        'UPDATE proficiency_test_results SET total_points = ? WHERE id = ?',
                        [actualTotal, row.id]
                    );
                } else if (actualTotal === row.old_total) {
                    console.log(`Result ${row.id} already correct: ${actualTotal}`);
                } else {
                    console.log(`Result ${row.id} has 0 points calculated? Skipping.`);
                }
            } catch (e) {
                console.error(`Error processing result ${row.id}:`, e.message);
            }
        }

        console.log('\n✅ Database records updated successfully!');

    } catch (e) {
        console.error('Connection Error:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();

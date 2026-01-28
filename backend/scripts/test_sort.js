import mysql from 'mysql2/promise';

async function testQuery() {
    const db = await mysql.createConnection({
        host: 'centerbeam.proxy.rlwy.net',
        port: 11633,
        user: 'root',
        password: 'TitRelhjpHWOHOvjDIVXEJesZfwhkXJB',
        database: 'beadb'
    });

    console.log("--- Testing Numeric Sort ---");
    const [rows] = await db.execute(
        `SELECT student_id FROM students 
         WHERE student_id LIKE 'BEA-ST-GEP-%' 
         ORDER BY CAST(SUBSTRING_INDEX(student_id, '-', -1) AS UNSIGNED) DESC 
         LIMIT 1`
    );

    if (rows.length > 0) {
        console.log("Highest numeric ID found:", rows[0].student_id);
        const lastParts = rows[0].student_id.split('-');
        const lastSequence = parseInt(lastParts[lastParts.length - 1]);
        console.log("Extracted sequence:", lastSequence);
        console.log("Proposed next sequence:", lastSequence + 1);
    } else {
        console.log("No IDs found for GEP.");
    }

    await db.end();
}

testQuery().catch(console.error);

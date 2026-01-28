import mysql from 'mysql2/promise';
import fs from 'fs';

async function dumpIds() {
    const db = await mysql.createConnection({
        host: 'centerbeam.proxy.rlwy.net',
        port: 11633,
        user: 'root',
        password: 'TitRelhjpHWOHOvjDIVXEJesZfwhkXJB',
        database: 'beadb'
    });

    const [rows] = await db.execute(
        "SELECT student_id, full_name, created_at FROM students WHERE student_id LIKE 'BEA-ST-GEP-%' ORDER BY student_id DESC LIMIT 50"
    );

    fs.writeFileSync('id_dump.json', JSON.stringify(rows, null, 2));
    console.log("Dumped 50 rows to id_dump.json");
    await db.end();
}

dumpIds().catch(console.error);

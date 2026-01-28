import mysql from 'mysql2/promise';

async function checkIds() {
    const db = await mysql.createConnection({
        host: 'centerbeam.proxy.rlwy.net',
        port: 11633,
        user: 'root',
        password: 'TitRelhjpHWOHOvjDIVXEJesZfwhkXJB',
        database: 'beadb'
    });

    console.log("--- Highest IDs for GEP ---");
    const [gepRows] = await db.execute(
        "SELECT student_id, created_at FROM students WHERE student_id LIKE 'BEA-ST-GEP-%' ORDER BY student_id DESC LIMIT 20"
    );
    console.log("GEP_ROWS:" + JSON.stringify(gepRows));

    console.log("\n--- Checking for exact duplicate of the reported ID ---");
    const [dupCheck] = await db.execute(
        "SELECT * FROM students WHERE student_id = 'BEA-ST-GEP-280126-105'"
    );
    console.log("Found matching ID:", dupCheck.length > 0 ? "YES" : "NO");
    if (dupCheck.length > 0) {
        console.log("Existing record details:", {
            full_name: dupCheck[0].full_name,
            email: dupCheck[0].email,
            created_at: dupCheck[0].created_at
        });
    }

    await db.end();
}

checkIds().catch(console.error);

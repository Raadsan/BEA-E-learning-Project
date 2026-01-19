import db from './dbconfig.js';

const checkTable = async () => {
    try {
        // Check for table existence and exact name
        const [tables] = await db.promise().query("SHOW TABLES LIKE 'IELTSTOEFL'"); // Case insensitive usually, but good to check exact
        if (tables.length === 0) {
            console.log("Table IELTSTOEFL not found (trying lowercase...)");
            const [tablesLower] = await db.promise().query("SHOW TABLES LIKE 'ieltstoefl'");
            if (tablesLower.length > 0) console.log("Found table: ieltstoefl");
        } else {
            console.log("Found table: IELTSTOEFL");
        }

        const [columns] = await db.promise().query("DESCRIBE IELTSTOEFL");
        console.table(columns);
        process.exit(0);
    } catch (error) {
        console.error("Error checking table:", error.message); // Log message only to avoid clutter
        // Fallback to try finding similar names
        try {
            const [allTables] = await db.promise().query("SHOW TABLES");
            const matching = allTables.map(t => Object.values(t)[0]).filter(n => n.toLowerCase().includes('ielts'));
            console.log("Similar tables:", matching);
        } catch (e) { }
        process.exit(1);
    }
};

checkTable();

import db from './dbconfig.js';

const checkTable = async () => {
    try {
        const [rows] = await db.promise().query("SHOW TABLES LIKE 'professional_test_results'");
        if (rows.length > 0) {
            console.log("Table 'professional_test_results' exists.");
            const [columns] = await db.promise().query("DESCRIBE professional_test_results");
            console.table(columns);
        } else {
            console.log("Table 'professional_test_results' does NOT exist.");
        }

        // Also check proficiency_test_results for comparison
        const [profRows] = await db.promise().query("SHOW TABLES LIKE 'proficiency_test_results'");
        if (profRows.length > 0) {
            console.log("Table 'proficiency_test_results' exists.");
            const [profColumns] = await db.promise().query("DESCRIBE proficiency_test_results");
            console.table(profColumns);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error checking table:", error);
        process.exit(1);
    }
};

checkTable();

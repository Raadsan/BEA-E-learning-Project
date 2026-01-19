import db from './dbconfig.js';

const checkColumns = async () => {
    try {
        const [columns] = await db.promise().query("DESCRIBE students");
        const columnNames = columns.map(c => c.Field);
        console.log("Columns:", columnNames.join(", "));

        if (columnNames.includes('name')) {
            console.log("✅ Column 'name' exists.");
        } else {
            console.log("❌ Column 'name' does NOT exist.");
        }

        if (columnNames.includes('full_name')) {
            console.log("✅ Column 'full_name' exists.");
        } else {
            console.log("❌ Column 'full_name' does NOT exist.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkColumns();

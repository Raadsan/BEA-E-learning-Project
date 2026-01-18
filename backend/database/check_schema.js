import db from './dbconfig.js';

const checkSchema = async () => {
    try {
        const [rows] = await db.promise().query("DESCRIBE students");
        console.log("Students Table Schema:");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error describing table:", error);
        process.exit(1);
    }
};

checkSchema();

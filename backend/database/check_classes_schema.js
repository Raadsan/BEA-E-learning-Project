
import db from "./dbconfig.js";

const checkSchema = async () => {
    try {
        const dbp = db.promise();
        const [rows] = await dbp.query("DESCRIBE classes");
        console.log("Current schema of 'classes' table:");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        process.exit(1);
    }
};

checkSchema();

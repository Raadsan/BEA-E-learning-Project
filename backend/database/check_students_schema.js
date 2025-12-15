
import db from "./dbconfig.js";

const checkSchema = async () => {
    try {
        const dbp = db.promise();
        const [rows] = await dbp.query("DESCRIBE students");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSchema();

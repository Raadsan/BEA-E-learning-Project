
import db from "./database/dbconfig.js";
const dbp = db.promise();
async function check() {
    try {
        const [rows] = await dbp.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'payments' 
            AND COLUMN_NAME = 'student_id' 
            AND REFERENCED_TABLE_NAME = 'students'
        `);
        console.log("FK NAME:", rows[0]?.CONSTRAINT_NAME);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();

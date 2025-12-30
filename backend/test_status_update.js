
import db from './database/dbconfig.js';

async function testUpdate() {
    try {
        // Find a student to test on (limit 1)
        const [rows] = await db.promise().query("SELECT id FROM students LIMIT 1");
        if (rows.length === 0) {
            console.log('No students to test on.');
            process.exit(0);
        }
        const id = rows[0].id;

        console.log(`Testing update on student ID ${id} to 'inactive'...`);
        await db.promise().query("UPDATE students SET approval_status = 'inactive' WHERE id = ?", [id]);
        console.log("✅ Successfully updated status to 'inactive'.");

        console.log(`Reverting update on student ID ${id} to 'approved'...`);
        await db.promise().query("UPDATE students SET approval_status = 'approved' WHERE id = ?", [id]);
        console.log("✅ Successfully reverted status to 'approved'.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to update status:", err);
        process.exit(1);
    }
}

testUpdate();

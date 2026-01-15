import db from "./database/dbconfig.js";

const dbp = db.promise();

async function expireStudent() {
    try {
        const email = 'faysalmaxameddahir@gmail.com';
        console.log(`Setting paid_until to past date for ${email}...`);

        const [result] = await dbp.query(
            "UPDATE students SET paid_until = '2025-12-31' WHERE email = ?",
            [email]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Update successful. Student access is now EXPIRED.');
        } else {
            console.log('❌ Student not found with that email.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating student:', error);
        process.exit(1);
    } 
}

expireStudent();

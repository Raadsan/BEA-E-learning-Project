import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        console.log("--- Student Table Sample ---");
        const [students] = await dbp.query("SELECT student_id, full_name FROM students LIMIT 3");
        students.forEach(s => console.log(`student_id: ${s.student_id}, name: ${s.full_name}`));

        console.log("\n--- Payments Table Sample ---");
        const [payments] = await dbp.query("SELECT student_id, amount FROM payments LIMIT 3");
        payments.forEach(p => console.log(`student_id: ${p.student_id}, amount: ${p.amount}`));

        console.log("\n--- Schema Check ---");
        const [pMeta] = await dbp.query("DESCRIBE payments");
        const sIdMeta = pMeta.find(m => m.Field === 'student_id');
        console.log(`Payments table 'student_id' type: ${sIdMeta ? sIdMeta.Type : 'NOT FOUND'}`);

        const [sMeta] = await dbp.query("DESCRIBE students");
        const ssIdMeta = sMeta.find(m => m.Field === 'student_id');
        console.log(`Students table 'student_id' type: ${ssIdMeta ? ssIdMeta.Type : 'NOT FOUND'}`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

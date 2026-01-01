import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        console.log("Checking students table...");
        const [students] = await dbp.query("SELECT student_id, full_name FROM students LIMIT 5");
        console.log("Students Sample:");
        console.table(students);

        console.log("\nChecking payments table...");
        const [payments] = await dbp.query("SELECT student_id, amount FROM payments LIMIT 5");
        console.log("Payments Sample:");
        console.table(payments);

        const [paymentSchema] = await dbp.query("DESCRIBE payments");
        console.log("\nPayments Schema:");
        console.table(paymentSchema);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

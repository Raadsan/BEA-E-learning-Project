import db from "./dbconfig.js";

const dbp = db.promise();

async function check() {
    try {
        console.log("Checking schema for students table...");
        const [students] = await dbp.query("DESCRIBE students");
        console.log("Students Table Columns:");
        console.table(students);

        const [ielts] = await dbp.query("DESCRIBE IELTSTOEFL");
        console.log("IELTSTOEFL Table Columns:");
        console.table(ielts);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();

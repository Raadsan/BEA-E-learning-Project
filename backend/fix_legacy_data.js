import db from "./database/dbconfig.js";

const dbp = db.promise();

async function fixData() {
    try {
        console.log("🛠️ Fixing Legacy Data...");

        // 1. Fix Muzamil -> Digital Literacy and Virtual
        const [res1] = await dbp.query(
            "UPDATE students SET chosen_program = 'Digital Literacy and Virtual' WHERE chosen_program = 'Muzamil'"
        );
        console.log(`✅ Fixed 'Muzamil': ${res1.affectedRows} rows updated.`);

        // 2. Fix English2 -> 8- Level General English Course for Adults
        const [res2] = await dbp.query(
            "UPDATE students SET chosen_program = '8- Level General English Course for Adults' WHERE chosen_program = 'English2'"
        );
        console.log(`✅ Fixed 'English2': ${res2.affectedRows} rows updated.`);

        // 3. Fix IELTS/TOEFL -> IELTS & TOFEL Preparation Course
        const [res3] = await dbp.query(
            "UPDATE students SET chosen_program = 'IELTS & TOFEL Preparation Course' WHERE chosen_program = 'IELTS/TOEFL'"
        );
        console.log(`✅ Fixed 'IELTS/TOEFL': ${res3.affectedRows} rows updated.`);

        console.log("🎉 All Done!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

fixData();

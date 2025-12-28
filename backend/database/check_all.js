// Check both regular and IELTS students
import db from "./dbconfig.js";

const dbp = db.promise();

async function checkBothTables() {
    try {
        // Check regular students
        const [regularStudents] = await dbp.query(`
            SELECT id, full_name, email, chosen_subprogram 
            FROM students 
            ORDER BY id DESC LIMIT 5
        `);

        console.log("Recent regular students:");
        regularStudents.forEach(s => {
            console.log(`  ${s.id}: ${s.full_name} - Subprogram: ${s.chosen_subprogram}`);
        });

        // Check IELTS students
        const [ieltsStudents] = await dbp.query(`
            SELECT id, first_name, last_name, email 
            FROM ielts_toefl_students 
            ORDER BY id DESC LIMIT 5
        `);

        console.log("\nRecent IELTS/TOEFL students:");
        ieltsStudents.forEach(s => {
            console.log(`  ${s.id}: ${s.first_name} ${s.last_name}`);
        });

        // Check all materials
        const [materials] = await dbp.query(`
            SELECT id, title, subprogram_id, status 
            FROM learning_materials 
            ORDER BY id DESC LIMIT 5
        `);

        console.log("\nRecent materials:");
        materials.forEach(m => {
            console.log(`  ${m.id}: ${m.title} - Subprogram: ${m.subprogram_id} - Status: ${m.status}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

checkBothTables();

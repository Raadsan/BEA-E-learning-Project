// Check student Muzamil's exact data
import db from "./dbconfig.js";

const dbp = db.promise();

async function checkMuzamil() {
    try {
        // Find Muzamil
        const [students] = await dbp.query(`
            SELECT id, full_name, email, chosen_program, chosen_subprogram
            FROM students
            WHERE full_name LIKE '%Muzamil%' OR email LIKE '%muzamil%'
        `);

        if (students.length === 0) {
            console.log("❌ Student Muzamil not found");
            process.exit(0);
        }

        const student = students[0];
        console.log("👤 Student Found:");
        console.log(`   ID: ${student.id}`);
        console.log(`   Name: ${student.full_name}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Program: ${student.chosen_program}`);
        console.log(`   Subprogram: ${student.chosen_subprogram}`);
        console.log(`   Subprogram Type: ${typeof student.chosen_subprogram}`);

        // Check if it's a number or string
        if (student.chosen_subprogram) {
            // Try to find materials
            const [materials] = await dbp.query(`
                SELECT id, title, subprogram_id, status
                FROM learning_materials
                WHERE subprogram_id = ? AND status = 'Active'
            `, [student.chosen_subprogram]);

            console.log(`\n📚 Materials for subprogram ${student.chosen_subprogram}:`);
            console.log(`   Found: ${materials.length} materials`);

            if (materials.length > 0) {
                materials.forEach(m => {
                    console.log(`   - ${m.title} (ID: ${m.id})`);
                });
            }

            // Check all materials
            const [allMaterials] = await dbp.query(`
                SELECT id, title, subprogram_id
                FROM learning_materials
                WHERE status = 'Active'
            `);

            console.log(`\n📊 All Active Materials:`);
            allMaterials.forEach(m => {
                console.log(`   Subprogram ${m.subprogram_id}: ${m.title}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

checkMuzamil();

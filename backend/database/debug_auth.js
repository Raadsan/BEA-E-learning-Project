// Check what's happening when student logs in
import db from "./dbconfig.js";

const dbp = db.promise();

async function debugAuth() {
    try {
        console.log("🔍 Debugging Authentication & Materials\n");

        // Check all students
        const [students] = await dbp.query(`
            SELECT id, full_name, email, chosen_program, chosen_subprogram
            FROM students
            ORDER BY id DESC
        `);

        console.log("📋 All Students:");
        students.forEach(s => {
            console.log(`   ${s.id}: ${s.full_name} (${s.email})`);
            console.log(`      Program: ${s.chosen_program}, Subprogram: ${s.chosen_subprogram}`);
        });

        // Check materials for each student
        console.log("\n📚 Materials per student:");
        for (const student of students) {
            if (student.chosen_subprogram) {
                const [materials] = await dbp.query(`
                    SELECT COUNT(*) as count
                    FROM learning_materials
                    WHERE subprogram_id = ? AND status = 'Active'
                `, [student.chosen_subprogram]);

                console.log(`   ${student.full_name}: ${materials[0].count} materials (subprogram ${student.chosen_subprogram})`);
            } else {
                console.log(`   ${student.full_name}: ❌ No subprogram assigned`);
            }
        }

        // Check all active materials
        const [allMaterials] = await dbp.query(`
            SELECT id, title, subprogram_id, status
            FROM learning_materials
            WHERE status = 'Active'
        `);

        console.log(`\n📊 Total Active Materials: ${allMaterials.length}`);
        allMaterials.forEach(m => {
            console.log(`   - "${m.title}" (Subprogram: ${m.subprogram_id})`);
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

debugAuth();

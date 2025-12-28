// Diagnostic script to check student and materials matching
import db from "./dbconfig.js";

const dbp = db.promise();

async function diagnose() {
    try {
        console.log("🔍 DIAGNOSTIC CHECK\n");

        // Find student named Muusini
        const [students] = await dbp.query(`
            SELECT id, full_name, email, chosen_program, chosen_subprogram 
            FROM students 
            WHERE full_name LIKE '%Muusini%' OR email LIKE '%muusini%'
            LIMIT 5
        `);

        console.log("📋 Students found:");
        students.forEach(s => {
            console.log(`\n  ID: ${s.id}`);
            console.log(`  Name: ${s.full_name}`);
            console.log(`  Email: ${s.email}`);
            console.log(`  Program: ${s.chosen_program}`);
            console.log(`  Subprogram ID: ${s.chosen_subprogram}`);
        });

        if (students.length === 0) {
            console.log("\n❌ No student found with name 'Muusini'");
            process.exit(0);
        }

        const student = students[0];
        console.log(`\n\n🎯 Checking materials for student: ${student.full_name}`);
        console.log(`   Subprogram ID: ${student.chosen_subprogram}\n`);

        // Get all materials
        const [allMaterials] = await dbp.query(`
            SELECT id, title, type, program_id, subprogram_id, status
            FROM learning_materials
            ORDER BY created_at DESC
        `);

        console.log(`📚 Total materials in database: ${allMaterials.length}\n`);

        // Get materials that match this student's subprogram
        const [matchingMaterials] = await dbp.query(`
            SELECT m.*, p.title as program_name, sp.subprogram_name
            FROM learning_materials m
            LEFT JOIN programs p ON m.program_id = p.id
            LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
            WHERE m.subprogram_id = ?
            AND m.status = 'Active'
            ORDER BY m.created_at DESC
        `, [student.chosen_subprogram]);

        console.log(`✅ Materials matching subprogram ${student.chosen_subprogram}: ${matchingMaterials.length}\n`);

        if (matchingMaterials.length > 0) {
            console.log("Matching materials:");
            matchingMaterials.forEach((m, idx) => {
                console.log(`\n${idx + 1}. ${m.title}`);
                console.log(`   Type: ${m.type}`);
                console.log(`   Subprogram: ${m.subprogram_name} (ID: ${m.subprogram_id})`);
                console.log(`   Status: ${m.status}`);
            });
        } else {
            console.log("❌ NO MATCHING MATERIALS FOUND!");
            console.log("\nAll materials in database:");
            allMaterials.forEach((m, idx) => {
                console.log(`\n${idx + 1}. ${m.title}`);
                console.log(`   Subprogram ID: ${m.subprogram_id}`);
                console.log(`   Status: ${m.status}`);
            });
        }

        // Get subprogram details
        if (student.chosen_subprogram) {
            const [subprogram] = await dbp.query(`
                SELECT * FROM subprograms WHERE id = ?
            `, [student.chosen_subprogram]);

            if (subprogram.length > 0) {
                console.log(`\n\n📖 Student's Subprogram Details:`);
                console.log(`   ID: ${subprogram[0].id}`);
                console.log(`   Name: ${subprogram[0].subprogram_name}`);
                console.log(`   Program ID: ${subprogram[0].program_id}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

diagnose();

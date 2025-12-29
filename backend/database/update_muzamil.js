// Update Muzamil's subprogram to A1 (ID: 24)
import db from "./dbconfig.js";

const dbp = db.promise();

async function updateMuzamilSubprogram() {
    try {
        console.log("🔄 Updating Muzamil's subprogram...\n");

        // First, verify A1 - Beginner subprogram ID
        const [subprograms] = await dbp.query(`
            SELECT id, subprogram_name
            FROM subprograms
            WHERE subprogram_name LIKE '%A1%'
        `);

        if (subprograms.length === 0) {
            console.log("❌ A1 subprogram not found!");
            process.exit(1);
        }

        const a1Subprogram = subprograms[0];
        console.log(`✓ Found subprogram: ${a1Subprogram.subprogram_name} (ID: ${a1Subprogram.id})`);

        // Update Muzamil's subprogram
        const [result] = await dbp.query(`
            UPDATE students
            SET chosen_subprogram = ?
            WHERE email = 'muzamil@gmail.com'
        `, [a1Subprogram.id]);

        console.log(`\n✅ Updated ${result.affectedRows} student(s)`);

        // Verify the update
        const [student] = await dbp.query(`
            SELECT id, full_name, chosen_program, chosen_subprogram
            FROM students
            WHERE email = 'muzamil@gmail.com'
        `);

        console.log(`\n👤 Student after update:`);
        console.log(`   Name: ${student[0].full_name}`);
        console.log(`   Program: ${student[0].chosen_program}`);
        console.log(`   Subprogram: ${student[0].chosen_subprogram}`);

        // Check materials
        const [materials] = await dbp.query(`
            SELECT COUNT(*) as count
            FROM learning_materials
            WHERE subprogram_id = ? AND status = 'Active'
        `, [a1Subprogram.id]);

        console.log(`\n📚 Materials available: ${materials[0].count}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

updateMuzamilSubprogram();

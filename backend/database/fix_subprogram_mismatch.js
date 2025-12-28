// Fix the subprogram ID mismatch
import db from "./dbconfig.js";

const dbp = db.promise();

async function fixSubprogramMismatch() {
    try {
        console.log("🔧 Fixing Subprogram ID Mismatch\n");

        // Find A1 - Beginner subprogram
        const [a1Subprogram] = await dbp.query(`
            SELECT id, subprogram_name
            FROM subprograms
            WHERE subprogram_name LIKE '%A1%'
        `);

        if (a1Subprogram.length === 0) {
            console.log("❌ A1 subprogram not found!");
            process.exit(1);
        }

        const correctA1Id = a1Subprogram[0].id;
        console.log(`✓ A1 - Beginner subprogram ID: ${correctA1Id}`);

        // Update ALL materials with subprogram_id = 24 to use the correct ID
        const [updateResult] = await dbp.query(`
            UPDATE learning_materials
            SET subprogram_id = ?
            WHERE subprogram_id = 24
        `, [correctA1Id]);

        console.log(`✅ Updated ${updateResult.affectedRows} materials from subprogram 24 to ${correctA1Id}`);

        // Verify muzamil's subprogram
        const [muzamil] = await dbp.query(`
            SELECT id, full_name, chosen_subprogram
            FROM students
            WHERE email = 'muzamil@gmail.com'
        `);

        if (muzamil.length > 0) {
            console.log(`\n👤 Student: ${muzamil[0].full_name}`);
            console.log(`   Subprogram: ${muzamil[0].chosen_subprogram}`);

            // Count materials for muzamil
            const [materialCount] = await dbp.query(`
                SELECT COUNT(*) as count
                FROM learning_materials
                WHERE subprogram_id = ? AND status = 'Active'
            `, [muzamil[0].chosen_subprogram]);

            console.log(`   Materials available: ${materialCount[0].count}`);

            if (materialCount[0].count > 0) {
                // Show the materials
                const [materials] = await dbp.query(`
                    SELECT id, title, type, url
                    FROM learning_materials
                    WHERE subprogram_id = ? AND status = 'Active'
                `, [muzamil[0].chosen_subprogram]);

                console.log(`\n📚 Materials student will see:`);
                materials.forEach((m, idx) => {
                    console.log(`   ${idx + 1}. ${m.title} (${m.type})`);
                    console.log(`      URL: ${m.url}`);
                });
            }
        }

        console.log(`\n✅ FIX COMPLETE! Refresh the student portal to see materials.`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

fixSubprogramMismatch();

// Fix materials - update subprogram_id from 24 to 17 (A1 - Beginner)
import db from "./dbconfig.js";

const dbp = db.promise();

async function fixMaterials() {
    try {
        console.log("🔧 Fixing materials subprogram IDs...\n");

        // Get the correct A1 subprogram ID
        const [a1Subprogram] = await dbp.query(`
            SELECT id, subprogram_name
            FROM subprograms
            WHERE subprogram_name LIKE '%A1%'
            LIMIT 1
        `);

        if (a1Subprogram.length === 0) {
            console.log("❌ A1 subprogram not found!");
            process.exit(1);
        }

        const correctId = a1Subprogram[0].id;
        console.log(`✓ Found A1 subprogram: ${a1Subprogram[0].subprogram_name} (ID: ${correctId})`);

        // Find materials with wrong subprogram_id
        const [wrongMaterials] = await dbp.query(`
            SELECT id, title, subprogram_id
            FROM learning_materials
            WHERE subprogram_id NOT IN (SELECT id FROM subprograms)
            OR subprogram_id IS NULL
        `);

        console.log(`\n📚 Found ${wrongMaterials.length} materials with invalid subprogram_id`);

        if (wrongMaterials.length > 0) {
            // Update them to A1 (ID: 17)
            const [result] = await dbp.query(`
                UPDATE learning_materials
                SET subprogram_id = ?
                WHERE subprogram_id NOT IN (SELECT id FROM subprograms)
                OR subprogram_id IS NULL
            `, [correctId]);

            console.log(`✅ Updated ${result.affectedRows} materials to subprogram ${correctId}`);
        }

        // Verify
        const [materials] = await dbp.query(`
            SELECT m.id, m.title, m.subprogram_id, sp.subprogram_name
            FROM learning_materials m
            LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
            WHERE m.status = 'Active'
        `);

        console.log(`\n📋 All Active Materials after fix:`);
        materials.forEach(m => {
            console.log(`   - "${m.title}" → Subprogram: ${m.subprogram_name || 'NULL'} (ID: ${m.subprogram_id})`);
        });

        // Check if Muzamil can now see materials
        const [muzamil] = await dbp.query(`
            SELECT chosen_subprogram FROM students WHERE email = 'muzamil@gmail.com'
        `);

        if (muzamil.length > 0) {
            const [count] = await dbp.query(`
                SELECT COUNT(*) as total
                FROM learning_materials
                WHERE subprogram_id = ? AND status = 'Active'
            `, [muzamil[0].chosen_subprogram]);

            console.log(`\n✅ Muzamil can now see ${count[0].total} materials!`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

fixMaterials();

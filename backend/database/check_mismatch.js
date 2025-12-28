// Check subprograms and materials mismatch
import db from "./dbconfig.js";

const dbp = db.promise();

async function checkMismatch() {
    try {
        console.log("🔍 Checking Subprograms and Materials\n");

        // Get all subprograms
        const [subprograms] = await dbp.query(`
            SELECT id, subprogram_name, program_id
            FROM subprograms
            ORDER BY id
        `);

        console.log("📋 Subprograms in database:");
        subprograms.forEach(sp => {
            console.log(`   ID ${sp.id}: ${sp.subprogram_name} (Program: ${sp.program_id})`);
        });

        // Get all materials with their subprogram IDs
        const [materials] = await dbp.query(`
            SELECT id, title, subprogram_id, status
            FROM learning_materials
            WHERE status = 'Active'
        `);

        console.log(`\n📚 Active Materials (${materials.length} total):`);
        materials.forEach(m => {
            const matchingSubprogram = subprograms.find(sp => sp.id === m.subprogram_id);
            console.log(`   Material "${m.title}"`);
            console.log(`     Subprogram ID: ${m.subprogram_id}`);
            console.log(`     Subprogram Name: ${matchingSubprogram ? matchingSubprogram.subprogram_name : '❌ NOT FOUND IN SUBPROGRAMS TABLE!'}`);
        });

        // Find orphaned materials
        console.log(`\n⚠️  Materials with invalid subprogram_id:`);
        const orphaned = materials.filter(m => !subprograms.find(sp => sp.id === m.subprogram_id));
        if (orphaned.length > 0) {
            orphaned.forEach(m => {
                console.log(`   - "${m.title}" has subprogram_id = ${m.subprogram_id} (doesn't exist!)`);
            });
        } else {
            console.log(`   None - all materials have valid subprogram IDs`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

checkMismatch();

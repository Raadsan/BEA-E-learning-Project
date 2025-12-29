// Test script to check learning materials in database
import db from "./dbconfig.js";

const dbp = db.promise();

async function checkMaterials() {
    try {
        console.log("🔍 Checking learning_materials table...\n");

        // Get all materials
        const [materials] = await dbp.query(`
            SELECT m.id, m.title, m.type, m.program_id, m.subprogram_id, 
                   m.subject, m.status, p.title as program_name, 
                   sp.subprogram_name
            FROM learning_materials m
            LEFT JOIN programs p ON m.program_id = p.id
            LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
            ORDER BY m.created_at DESC
        `);

        console.log(`📊 Total materials in database: ${materials.length}\n`);

        if (materials.length === 0) {
            console.log("❌ NO MATERIALS FOUND IN DATABASE!");
            console.log("\n💡 Solution: Go to Admin → Learning Resources → Course Materials");
            console.log("   Click 'Add' and create materials with:");
            console.log("   - Program: Select a program (e.g., '8-Level General English Course for Adults')");
            console.log("   - Subprogram: Select a level (e.g., 'A1 - Beginner')");
            console.log("   - Title, Type, URL, etc.\n");
        } else {
            console.log("Materials found:");
            materials.forEach((m, idx) => {
                console.log(`\n${idx + 1}. ${m.title}`);
                console.log(`   Type: ${m.type}`);
                console.log(`   Program ID: ${m.program_id} (${m.program_name || 'N/A'})`);
                console.log(`   Subprogram ID: ${m.subprogram_id} (${m.subprogram_name || 'N/A'})`);
                console.log(`   Subject: ${m.subject || 'N/A'}`);
                console.log(`   Status: ${m.status}`);
            });
        }

        // Get all subprograms
        console.log("\n\n🎓 Available Subprograms:");
        const [subprograms] = await dbp.query(`
            SELECT id, subprogram_name, program_id 
            FROM subprograms 
            ORDER BY id
        `);

        subprograms.forEach(sp => {
            const materialsForThisSubprogram = materials.filter(m => m.subprogram_id === sp.id);
            console.log(`\n   ID ${sp.id}: ${sp.subprogram_name} - ${materialsForThisSubprogram.length} materials`);
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

checkMaterials();

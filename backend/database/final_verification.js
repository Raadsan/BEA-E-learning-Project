// Final verification - everything should work now
import db from "./dbconfig.js";

const dbp = db.promise();

async function finalVerification() {
    try {
        console.log("✅ FINAL VERIFICATION\n");

        // Get Muzamil
        const [student] = await dbp.query(`
            SELECT id, full_name, email, chosen_subprogram
            FROM students
            WHERE email = 'muzamiltahlil@gmail.com'
        `);

        if (student.length === 0) {
            console.log("❌ Student not found");
            process.exit(1);
        }

        const studentData = student[0];
        console.log("👤 Student: " + studentData.full_name);
        console.log("   Subprogram ID: " + studentData.chosen_subprogram);

        // Get materials
        const [materials] = await dbp.query(`
            SELECT m.id, m.title, m.type, m.url, m.subject, m.description,
                   p.title as program_name, sp.subprogram_name
            FROM learning_materials m
            LEFT JOIN programs p ON m.program_id = p.id
            LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
            WHERE m.subprogram_id = ? AND m.status = 'Active'
            ORDER BY m.created_at DESC
        `, [studentData.chosen_subprogram]);

        console.log(`\n📚 Materials Available: ${materials.length}\n`);

        if (materials.length > 0) {
            console.log("✅ SUCCESS! Student WILL see these materials:\n");
            materials.forEach((m, idx) => {
                console.log(`${idx + 1}. ${m.title}`);
                console.log(`   Type: ${m.type}`);
                console.log(`   Subprogram: ${m.subprogram_name}`);
                console.log(`   Program: ${m.program_name || 'N/A'}`);
                console.log(`   Subject: ${m.subject || 'N/A'}`);
                console.log(`   URL: ${m.url}`);
                console.log("");
            });

            console.log("🎉 EVERYTHING IS WORKING!");
            console.log("\nNext steps:");
            console.log("1. Refresh the browser (Ctrl+F5)");
            console.log("2. Go to Resources page");
            console.log("3. You will see " + materials.length + " material(s)!");
        } else {
            console.log("❌ No materials found - something is still wrong");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

finalVerification();

// Test the API endpoint directly
import db from "./dbconfig.js";

const dbp = db.promise();

async function testAPI() {
    try {
        console.log("🧪 Testing Student Materials API\n");

        // Get Muzamil's data
        const [student] = await dbp.query(`
            SELECT id, full_name, email, chosen_program, chosen_subprogram
            FROM students
            WHERE email = 'muzamil@gmail.com'
        `);

        if (student.length === 0) {
            console.log("❌ Student not found");
            process.exit(1);
        }

        const studentData = student[0];
        console.log("👤 Student:");
        console.log(`   ID: ${studentData.id}`);
        console.log(`   Name: ${studentData.full_name}`);
        console.log(`   Subprogram: ${studentData.chosen_subprogram}`);

        // Simulate the API call - get materials by subprogram
        const [materials] = await dbp.query(`
            SELECT m.*, p.title as program_name, sp.subprogram_name 
            FROM learning_materials m
            LEFT JOIN programs p ON m.program_id = p.id
            LEFT JOIN subprograms sp ON m.subprogram_id = sp.id
            WHERE m.subprogram_id = ?
            AND m.status = 'Active' 
            ORDER BY m.created_at DESC
        `, [studentData.chosen_subprogram]);

        console.log(`\n📚 API Response - Materials Found: ${materials.length}\n`);

        if (materials.length > 0) {
            console.log("Materials that will be displayed:");
            materials.forEach((m, idx) => {
                console.log(`\n${idx + 1}. ${m.title}`);
                console.log(`   Type: ${m.type}`);
                console.log(`   Program: ${m.program_name || 'N/A'}`);
                console.log(`   Subprogram: ${m.subprogram_name || 'N/A'}`);
                console.log(`   Subject: ${m.subject || 'N/A'}`);
                console.log(`   URL: ${m.url}`);
                console.log(`   Status: ${m.status}`);
            });

            console.log(`\n✅ SUCCESS! Student will see ${materials.length} material(s) on Resources page`);
        } else {
            console.log("❌ No materials found - student will see 'No Materials Available'");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

testAPI();

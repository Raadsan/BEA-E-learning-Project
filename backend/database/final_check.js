// Final verification - check if everything is connected
import db from "./dbconfig.js";

const dbp = db.promise();

async function finalCheck() {
    try {
        console.log("🔍 FINAL VERIFICATION\n");

        // Get all students
        const [students] = await dbp.query(`
            SELECT id, full_name, email, chosen_subprogram 
            FROM students 
            ORDER BY id DESC 
            LIMIT 10
        `);

        console.log("📋 Students:");
        students.forEach(s => {
            console.log(`  ${s.id}: ${s.full_name} (${s.email}) - Subprogram: ${s.chosen_subprogram || 'NOT SET'}`);
        });

        // Get materials count by subprogram
        const [materialCounts] = await dbp.query(`
            SELECT subprogram_id, COUNT(*) as count
            FROM learning_materials
            WHERE status = 'Active'
            GROUP BY subprogram_id
        `);

        console.log("\n📚 Active Materials by Subprogram:");
        materialCounts.forEach(m => {
            console.log(`  Subprogram ${m.subprogram_id}: ${m.count} materials`);
        });

        // Check if any student has materials
        console.log("\n✅ Students with matching materials:");
        for (const student of students) {
            if (student.chosen_subprogram) {
                const [materials] = await dbp.query(`
                    SELECT COUNT(*) as count
                    FROM learning_materials
                    WHERE subprogram_id = ? AND status = 'Active'
                `, [student.chosen_subprogram]);

                if (materials[0].count > 0) {
                    console.log(`  ✓ ${student.full_name}: ${materials[0].count} materials`);
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

finalCheck();

import db from "./database/dbconfig.js";

const dbp = db.promise();

async function checkSync() {
    try {
        console.log("🔍 Checking Program Data Sync...");

        // 1. Get all Defined Programs
        const [programs] = await dbp.query("SELECT id, title, status FROM programs ORDER BY title");
        console.log("\n📋 DEFINED PROGRAMS (in 'programs' table):");
        programs.forEach(p => console.log(` - [${p.id}] "${p.title}" (${p.status})`));

        // 2. Get all Student Program Assignments
        const [stats] = await dbp.query(`
      SELECT chosen_program, COUNT(*) as count 
      FROM students 
      GROUP BY chosen_program 
      ORDER BY chosen_program
    `);

        console.log("\n🎓 STUDENT ASSIGNMENTS (in 'students' table):");
        stats.forEach(s => {
            // Check if this program exists in the programs list
            const exists = programs.find(p => p.title === s.chosen_program);
            const status = exists ? "✅ Match" : "❌ ORPHAN (Old Name?)";
            console.log(` - "${s.chosen_program || 'NULL'}": ${s.count} students  ${status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkSync();

// Simple check - what's the student's subprogram?
import db from "./dbconfig.js";

const dbp = db.promise();

async function quickCheck() {
    try {
        // Check student
        const [student] = await dbp.query(`
            SELECT id, full_name, chosen_subprogram 
            FROM students 
            WHERE full_name LIKE '%Muusini%' 
            LIMIT 1
        `);

        if (student.length === 0) {
            console.log("No student found");
            process.exit(0);
        }

        console.log("Student:", student[0].full_name);
        console.log("Subprogram ID:", student[0].chosen_subprogram);

        // Check materials for that subprogram
        const [materials] = await dbp.query(`
            SELECT COUNT(*) as count 
            FROM learning_materials 
            WHERE subprogram_id = ? AND status = 'Active'
        `, [student[0].chosen_subprogram]);

        console.log("Materials for this subprogram:", materials[0].count);

        // Check all materials
        const [all] = await dbp.query(`
            SELECT subprogram_id, COUNT(*) as count 
            FROM learning_materials 
            WHERE status = 'Active'
            GROUP BY subprogram_id
        `);

        console.log("\nMaterials by subprogram:");
        all.forEach(row => {
            console.log(`  Subprogram ${row.subprogram_id}: ${row.count} materials`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

quickCheck();

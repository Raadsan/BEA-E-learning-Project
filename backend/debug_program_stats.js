
import db from './database/dbconfig.js';

const dbp = db.promise();

async function debugStats() {
    try {
        console.log("Fetching Data...");
        const [programs] = await dbp.query("SELECT * FROM programs");
        const [students] = await dbp.query("SELECT * FROM students"); // Get all students
        const [classes] = await dbp.query("SELECT c.*, s.program_id FROM classes c JOIN subprograms s ON c.subprogram_id = s.id");

        console.log(`Total Programs: ${programs.length}`);
        console.log(`Total Students: ${students.length}`);
        console.log(`Total Classes: ${classes.length}`);

        const stats = programs.map(program => {
            let count = 0;
            const reasons = [];

            students.forEach(student => {
                let inProgram = false;

                // 1. Direct Link
                if (student.chosen_program == program.id) {
                    inProgram = true;
                    // reasons.push(`Student ${student.id} linked directly`);
                }
                // 2. Class Link
                else if (student.class_id) {
                    const cls = classes.find(c => c.id == student.class_id);
                    if (cls) {
                        // console.log(`Checking Class ${cls.id}: cls.program_id=${cls.program_id} vs prog.id=${program.id}`);
                        if (cls.program_id == program.id) {
                            inProgram = true;
                            // reasons.push(`Student ${student.id} linked via Class ${cls.id}`);
                        }
                    }
                }

                if (inProgram) count++;
            });

            return { name: program.title, count };
        });

        console.log("\n--- Calculated Stats ---");
        stats.forEach(s => console.log(`${s.name}: ${s.count}`));

    } catch (err) {
        console.error("Error:", err);
    }
    process.exit();
}

debugStats();

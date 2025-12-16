
import db from './database/dbconfig.js';

async function debug() {
    const dbp = db.promise();
    try {
        const [students] = await dbp.query("SELECT id, full_name, chosen_program, class_id FROM students");
        const [classes] = await dbp.query("SELECT id, class_name, program_id FROM classes");
        const [programs] = await dbp.query("SELECT id, title FROM programs");

        console.log(`Total Students: ${students.length}`);
        console.log(`Total Classes: ${classes.length}`);
        console.log(`Total Programs: ${programs.length}`);

        let linkedCount = 0;
        programs.forEach(p => {
            let pCount = 0;
            students.forEach(s => {
                let linked = false;
                if (s.chosen_program == p.id) linked = true;
                else if (s.class_id) {
                    const cls = classes.find(c => c.id === s.class_id);
                    if (cls && cls.program_id == p.id) linked = true;
                }
                if (linked) pCount++;
            });
            console.log(`Program "${p.title}" (ID ${p.id}): ${pCount} students`);
            linkedCount += pCount;
        });
        console.log(`Total Linked Students: ${linkedCount}`);

    } catch (e) {
        console.error(e);
    }
    process.exit();
}

debug();

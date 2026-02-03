import db from "./database/dbconfig.js";
import fs from 'fs';

const dbp = db.promise();

async function debug() {
    try {
        const [programs] = await dbp.query("SELECT * FROM programs");
        const [subprograms] = await dbp.query("SELECT * FROM subprograms");
        const [configs] = await dbp.query("SELECT * FROM certificates");
        const [students] = await dbp.query("SELECT student_id, full_name, chosen_program, chosen_subprogram FROM students LIMIT 10");

        const data = {
            programs: programs.map(p => ({ id: p.id, title: p.title })),
            subprograms: subprograms.map(s => ({ id: s.id, name: s.subprogram_name || s.name, program_id: s.program_id })),
            configs: configs.map(c => ({ id: c.id, type: c.target_type, target_id: c.target_id, name: c.target_name })),
            students: students
        };

        fs.writeFileSync('debug_final.json', JSON.stringify(data, null, 2), 'utf8');
        console.log("Diagnostic data written to debug_final.json");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();

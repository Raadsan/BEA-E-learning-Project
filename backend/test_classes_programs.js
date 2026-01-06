import * as Class from './models/classModel.js';
import db from './database/dbconfig.js';

const test = async () => {
    try {
        console.log("Fetching classes...");
        const classes = await Class.getAllClasses();
        console.log(`Found ${classes.length} classes.`);

        // Print first 5 and any that have missing program_id
        console.log("\nSample Classes (and any with missing program_id):");
        classes.forEach((c, index) => {
            if (index < 5 || !c.program_id) {
                console.log(`[${c.id}] ${c.class_name}: ProgramID=${c.program_id}, SubProgramID=${c.subprogram_id}, ProgramName=${c.program_name}`);
            }
        });

        // Group by Program
        console.log("\nClasses by Program ID Summary:");
        Object.keys(byProgram).forEach(pid => {
            console.log(`ProgID ${pid}: ${byProgram[pid].length} classes.`);
        });

        console.log("\nDetails of NULL entries:");
        classes.filter(c => !c.program_id).forEach(c => {
            console.log(`Class ${c.class_name} has NO Program ID. SubProg=${c.subprogram_id}`);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        // Exit
        process.exit();
    }
};

test();

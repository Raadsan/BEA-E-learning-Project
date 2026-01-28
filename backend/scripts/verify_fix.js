import { generateStudentId } from '../utils/idGenerator.js';

async function verifyGenerator() {
    console.log("--- Verifying ID Generator ---");
    const programName = "8-Level General English Course for Adults";
    const nextId = await generateStudentId('students', programName);

    console.log("Calculated Next ID:", nextId);

    if (nextId.endsWith('-113')) {
        console.log("✅ SUCCESS: Correct sequence generated (113).");
    } else {
        console.error("❌ FAILURE: Expected sequence 113, got:", nextId);
    }

    process.exit();
}

verifyGenerator().catch(err => {
    console.error(err);
    process.exit(1);
});

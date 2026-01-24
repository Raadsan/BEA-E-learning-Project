
import db from "./dbconfig.js";
import { generateStudentId } from "../utils/idGenerator.js";

const dbp = db.promise();

async function addStudentIdToIelts() {
    try {
        console.log("Starting migration: Adding 'student_id' to IELTSTOEFL...");

        // 1. Check if column exists
        const [columns] = await dbp.query("SHOW COLUMNS FROM IELTSTOEFL");
        const hasStudentId = columns.some(c => c.Field === 'student_id');

        if (!hasStudentId) {
            console.log("Adding 'student_id' column...");
            await dbp.query("ALTER TABLE IELTSTOEFL ADD COLUMN student_id VARCHAR(50) AFTER id");
            await dbp.query("ALTER TABLE IELTSTOEFL ADD UNIQUE INDEX idx_student_id (student_id)");
            console.log("✅ Column 'student_id' added.");
        } else {
            console.log("⚠️ Column 'student_id' already exists.");
        }

        // 2. Populate missing IDs
        const [students] = await dbp.query("SELECT id, exam_type FROM IELTSTOEFL WHERE student_id IS NULL OR student_id = ''");

        if (students.length > 0) {
            console.log(`Populating IDs for ${students.length} students...`);
            for (const s of students) {
                const newId = await generateStudentId('IELTSTOEFL', s.exam_type || 'IELTS');
                await dbp.query("UPDATE IELTSTOEFL SET student_id = ? WHERE id = ?", [newId, s.id]);
                console.log(`Generated ID ${newId} for student record ${s.id}`);
            }
            console.log("✅ Missing IDs populated.");
        } else {
            console.log("No missing IDs to populate.");
        }

        console.log("✅ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

addStudentIdToIelts();

import db from "./database/dbconfig.js";

const fix_lengths = async () => {
    try {
        const dbp = db.promise();
        console.log("Increasing column lengths for IDs...");

        const tables = ["students", "IELTSTOEFL", "assignment_submissions", "attendance", "payments", "proficiency_test_submissions", "test_submissions", "writing_task_submissions"];

        await dbp.query("SET FOREIGN_KEY_CHECKS = 0");

        for (const table of tables) {
            console.log(`Updating ${table}.student_id to VARCHAR(50)...`);
            await dbp.query(`ALTER TABLE ${table} MODIFY student_id VARCHAR(50)`);
        }

        console.log("Updating teachers.teacher_id to VARCHAR(50)...");
        await dbp.query("ALTER TABLE teachers MODIFY teacher_id VARCHAR(50)");

        await dbp.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("Column expansion complete!");
    } catch (err) {
        console.error("Failed to update column lengths:", err);
    } finally {
        process.exit(0);
    }
};

fix_lengths();

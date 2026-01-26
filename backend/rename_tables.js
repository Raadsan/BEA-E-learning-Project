
import db from "./database/dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("Renaming tables...");
        await dbp.query("RENAME TABLE tests TO exams, test_submissions TO exam_submissions");
        console.log("✅ Tables renamed successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

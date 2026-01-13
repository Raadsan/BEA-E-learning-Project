
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const { default: db } = await import("./dbconfig.js");

const dbp = db.promise();

async function updateCourseWorkSchema() {
    try {
        console.log("🔄 Updating course_work table schema...");

        // 1. Make program_id nullable
        await dbp.query(`
            ALTER TABLE course_work 
            MODIFY COLUMN program_id INT NULL
        `);
        console.log("✅ Made program_id nullable");

        // 2. Add missing columns if they don't exist
        const [cols] = await dbp.query("DESCRIBE course_work");
        const columnNames = cols.map(c => c.Field);

        if (!columnNames.includes("word_count")) {
            await dbp.query("ALTER TABLE course_work ADD COLUMN word_count INT NULL");
            console.log("✅ Added word_count column");
        }

        if (!columnNames.includes("duration")) {
            await dbp.query("ALTER TABLE course_work ADD COLUMN duration INT NULL");
            console.log("✅ Added duration column");
        }

        if (!columnNames.includes("requirements")) {
            await dbp.query("ALTER TABLE course_work ADD COLUMN requirements TEXT NULL");
            console.log("✅ Added requirements column");
        }

        console.log("\n✅ course_work table updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating course_work table:", err);
        process.exit(1);
    }
}

updateCourseWorkSchema();

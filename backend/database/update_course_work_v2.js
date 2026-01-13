
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const { default: db } = await import("./dbconfig.js");
const dbp = db.promise();

async function updateCourseWorkSchemaV2() {
    try {
        console.log("🔄 Updating course_work table schema (V2)...");

        const [cols] = await dbp.query("DESCRIBE course_work");
        const columnNames = cols.map(c => c.Field);

        // 1. Add subprogram_id
        if (!columnNames.includes("subprogram_id")) {
            await dbp.query("ALTER TABLE course_work ADD COLUMN subprogram_id INT NULL");
            console.log("✅ Added subprogram_id column");

            // Add foreign key constraint if possible, but optional for now to avoid locking issues
            // await dbp.query("ALTER TABLE course_work ADD CONSTRAINT fk_cw_subprogram FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) ON DELETE SET NULL");
        } else {
            console.log("ℹ️ subprogram_id already exists");
        }

        // 2. Add unit
        if (!columnNames.includes("unit")) {
            await dbp.query("ALTER TABLE course_work ADD COLUMN unit VARCHAR(255) NULL");
            console.log("✅ Added unit column");
        } else {
            console.log("ℹ️ unit already exists");
        }

        console.log("\n✅ course_work table updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating course_work table:", err);
        process.exit(1);
    }
}

updateCourseWorkSchemaV2();

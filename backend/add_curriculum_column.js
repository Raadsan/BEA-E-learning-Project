import db from "./database/dbconfig.js";

const migrate = async () => {
    try {
        const dbp = db.promise();
        console.log("Checking if curriculum_file column exists in programs table...");

        const [columns] = await dbp.query("DESCRIBE programs");
        const columnExists = columns.some(c => c.Field === 'curriculum_file');

        if (!columnExists) {
            console.log("Adding curriculum_file column to programs table...");
            await dbp.query("ALTER TABLE programs ADD COLUMN curriculum_file VARCHAR(255) NULL");
            console.log("✅ Successfully added curriculum_file column");
        } else {
            console.log("ℹ️ curriculum_file column already exists");
        }

    } catch (err) {
        console.error("❌ Migration error:", err.message);
    } finally {
        process.exit(0);
    }
};

migrate();

import db from "./database/dbconfig.js";

async function migrate() {
    const dbp = db.promise();
    try {
        console.log("Adding subprogram_id to tests table...");
        await dbp.query("ALTER TABLE tests ADD COLUMN subprogram_id INT NULL AFTER program_id");
        console.log("Successfully added subprogram_id to tests table.");

        console.log("Adding status to oral_assignments if missing...");
        try {
            await dbp.query("ALTER TABLE oral_assignments ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
        } catch (e) {
            console.log("status already exists in oral_assignments or other error: ", e.message);
        }

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

migrate();

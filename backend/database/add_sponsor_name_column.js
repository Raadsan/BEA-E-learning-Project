
import dotenv from "dotenv";
dotenv.config({ path: './backend/.env' });

const { default: db } = await import("./dbconfig.js");

const dbp = db.promise();

async function addSponsorNameColumn() {
    try {
        console.log("🔄 Adding sponsor_name column to students table...");

        const [cols] = await dbp.query("DESCRIBE students");
        const columnNames = cols.map(c => c.Field);

        if (!columnNames.includes("sponsor_name")) {
            // Add sponsor_name after chosen_subprogram or before approval_status
            await dbp.query("ALTER TABLE students ADD COLUMN sponsor_name VARCHAR(255) NULL AFTER chosen_subprogram");
            console.log("✅ Added sponsor_name column");
        } else {
            console.log("ℹ️ sponsor_name already exists");
        }

        console.log("\n✅ Students table updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating students table:", err);
        process.exit(1);
    }
}

addSponsorNameColumn();

import db from "./database/dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("Adding recommended_level column to placement_test_results...");
        const query = `
            ALTER TABLE placement_test_results 
            ADD COLUMN recommended_level VARCHAR(50) AFTER percentage;
        `;
        await dbp.query(query);
        console.log("✅ Column added successfully.");
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ Column already exists, skipping.");
        } else {
            console.error("❌ Error adding column:", error.message);
        }
    } finally {
        process.exit();
    }
}

migrate();

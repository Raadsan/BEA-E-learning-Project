import db from "./dbconfig.js";

const dbp = db.promise();

async function addFeedbackColumns() {
    try {
        console.log("🔄 Adding feedback columns to placement_test_results...");

        // Add feedback_file column
        try {
            await dbp.query(`
                ALTER TABLE placement_test_results 
                ADD COLUMN feedback_file VARCHAR(255) DEFAULT NULL,
                ADD COLUMN essay_marks INT DEFAULT 0
            `);
            console.log("✅ Columns added successfully.");
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ Columns already exist. Skipping.");
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error("❌ Error running migration:", error);
    } finally {
        process.exit();
    }
}

addFeedbackColumns();

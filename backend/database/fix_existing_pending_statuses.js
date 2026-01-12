import db from "./dbconfig.js";

const dbp = db.promise();

async function fixPendingStatuses() {
    try {
        console.log("🔄 Starting fix for pending statuses...");

        // 1. Get all placement test results
        const [results] = await dbp.query("SELECT * FROM placement_test_results");
        console.log(`Found ${results.length} results to check.`);

        for (const result of results) {
            // 2. Get the associated test
            const [tests] = await dbp.query("SELECT * FROM placement_tests WHERE id = ?", [result.test_id]);
            const test = tests[0];

            if (!test) {
                console.warn(`⚠️ Test not found for result ID ${result.id}. Skipping.`);
                continue;
            }

            // 3. Parse questions to check for type 'essay'
            let questions = [];
            try {
                questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
            } catch (e) {
                console.error(`❌ Error parsing questions for test ID ${test.id}:`, e.message);
                continue;
            }

            const hasEssay = questions.some(q => q.type === 'essay');

            if (hasEssay) {
                // 4. If it has an essay, ensure status is 'pending_review'
                if (result.status !== 'pending_review') {
                    console.log(`📝 Updating Result ID ${result.id} (Student ${result.student_id}) to 'pending_review'...`);

                    // We also nullify recommended_level so it doesn't show up in the table until graded
                    await dbp.query(
                        "UPDATE placement_test_results SET status = 'pending_review', recommended_level = NULL WHERE id = ?",
                        [result.id]
                    );
                } else {
                    console.log(`✓ Result ID ${result.id} is already correct.`);
                }
            }
        }

        console.log("✅ Fix complete.");
    } catch (error) {
        console.error("❌ Error running fix script:", error);
    } finally {
        process.exit();
    }
}

fixPendingStatuses();

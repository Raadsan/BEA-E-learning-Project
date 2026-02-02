import db from "./database/dbconfig.js";

const dbp = db.promise();

async function debugData() {
    try {
        console.log("--- Proficiency Test Results Statuses ---");
        const [statuses] = await dbp.query("SELECT status, COUNT(*) as count FROM proficiency_test_results GROUP BY status");
        console.log(JSON.stringify(statuses, null, 2));

        console.log("\n--- Proficiency Test Students Count ---");
        const [pStudents] = await dbp.query("SELECT COUNT(*) as count FROM ProficiencyTestStudents");
        console.log("Count:", pStudents[0].count);

        console.log("\n--- Sample Join Check ---");
        const [joinCheck] = await dbp.query(`
            SELECT r.student_id, r.status,
                   p.student_id as p_id, p.sex as p_sex,
                   s.student_id as s_id, s.sex as s_sex,
                   i.student_id as i_id, i.sex as i_sex
            FROM proficiency_test_results r
            LEFT JOIN ProficiencyTestStudents p ON r.student_id = p.student_id
            LEFT JOIN students s ON r.student_id = s.student_id
            LEFT JOIN IELTSTOEFL i ON r.student_id = i.student_id
            LIMIT 5
        `);
        console.log(JSON.stringify(joinCheck, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

debugData();

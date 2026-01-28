import db from "./backend/database/dbconfig.js";
const dbp = db.promise();

async function getExamData() {
    try {
        const [exams] = await dbp.query("SELECT id, title, questions FROM exams WHERE id IN (1, 2, 3)");
        const [submissions] = await dbp.query("SELECT assignment_id, student_id, content FROM exam_submissions WHERE assignment_id IN (1, 2, 3)");

        console.log("EXAMS:");
        console.log(JSON.stringify(exams, null, 2));
        console.log("\nSUBMISSIONS:");
        console.log(JSON.stringify(submissions, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

getExamData();

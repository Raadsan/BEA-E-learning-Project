import db from "./database/dbconfig.js";
import fs from "fs";
const dbp = db.promise();

async function getExamData() {
    try {
        const [exams] = await dbp.query("SELECT id, title, questions FROM exams WHERE id IN (1, 2, 3)");
        const [submissions] = await dbp.query("SELECT assignment_id, student_id, content FROM exam_submissions WHERE assignment_id IN (1, 2, 3)");

        const data = {
            exams,
            submissions
        };

        fs.writeFileSync("exam_data_final.json", JSON.stringify(data, null, 2), "utf-8");
        console.log("SUCCESS: Exam data saved to exam_data_final.json");
        process.exit(0);
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
}

getExamData();

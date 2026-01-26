
import db from "./database/dbconfig.js";
import fs from "fs";

const queries = [
    "DESCRIBE exams",
    "DESCRIBE exam_submissions",
    "DESCRIBE writing_tasks",
    "DESCRIBE writing_task_submissions",
    "DESCRIBE course_work",
    "DESCRIBE course_work_submissions",
    "DESCRIBE oral_assignments",
    "DESCRIBE oral_assignment_submissions",
    "DESCRIBE students",
    "DESCRIBE classes",
    "DESCRIBE subprograms",
    "DESCRIBE programs"
];

async function run() {
    const dbp = db.promise();
    let output = "";
    for (const q of queries) {
        output += `--- ${q} ---\n`;
        const [rows] = await dbp.query(q);
        output += JSON.stringify(rows, null, 2) + "\n\n";
    }
    fs.writeFileSync("schema_output.txt", output);
    process.exit(0);
}

run();


import db from "./database/dbconfig.js";
import dotenv from "dotenv";
dotenv.config();

const dbp = db.promise();

async function runDebug() {
    try {
        console.log("Fetching a student...");
        const [students] = await dbp.query("SELECT student_id, full_name FROM students LIMIT 1");
        if (students.length === 0) {
            console.log("No students found.");
            process.exit(0);
        }
        const studentId = students[0].student_id;
        console.log(`Using Student ID: ${studentId} (${students[0].full_name})`);

        // Tables from assignmentController
        const tables = [
            { main: 'writing_tasks', sub: 'writing_task_submissions', type: 'writing_task' },
            { main: 'exams', sub: 'exam_submissions', type: 'exam' },
            { main: 'oral_assignments', sub: 'oral_assignment_submissions', type: 'oral_assignment' },
            { main: 'course_work', sub: 'course_work_submissions', type: 'course_work' }
        ];

        for (const t of tables) {
            const table = t.main;
            const subTable = t.sub;

            // Simplified query from getAssignments for student role
            // We'll check if table exists first basically by running query
            try {
                const hasSubprogramColumn = ['exams', 'oral_assignments', 'course_work'].includes(table);
                const subprogramJoinCondition = hasSubprogramColumn
                    ? 'sp.id = COALESCE(a.subprogram_id, c.subprogram_id)'
                    : 'sp.id = c.subprogram_id';

                let query = `
                    SELECT a.*, '${t.type}' as type,
                    s.status as submission_status
                    FROM ${table} a
                    LEFT JOIN classes c ON a.class_id = c.id
                    LEFT JOIN subprograms sp ON ${subprogramJoinCondition}
                    LEFT JOIN ${subTable} s ON a.id = s.assignment_id AND s.student_id = ?
                    LIMIT 2
                `;

                const [rows] = await dbp.query(query, [studentId]);
                console.log(`\n--- Results for ${t.type} ---`);
                if (rows.length > 0) {
                    const fs = await import('fs');
                    fs.appendFileSync('debug_output.txt', `\n--- Results for ${t.type} ---\n`);
                    fs.appendFileSync('debug_output.txt', "Keys: " + Object.keys(rows[0]).join(', ') + "\n");
                    fs.appendFileSync('debug_output.txt', "Sample Row: " + JSON.stringify(rows[0], null, 2) + "\n");
                }


            } catch (err) {
                console.log(`Error querying ${t.type}:`, err.message);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Critical error:", error);
        process.exit(1);
    }
}

runDebug();

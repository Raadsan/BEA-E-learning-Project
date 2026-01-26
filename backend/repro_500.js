
import db from "./database/dbconfig.js";

async function debug() {
    const dbp = db.promise();
    const studentId = "BEA-ST-GEP-221225-101"; // Use a valid ID
    console.log("Testing getMyClasses SQL Logic...");

    try {
        console.log("1. Testing Profile Queries...");
        const profileQueries = [
            `SELECT c.id, c.class_name, 1 as is_active,
                    COALESCE(s.subprogram_name, st.chosen_subprogram) as subprogram_name,
                    COALESCE(p.title, st.chosen_program) as program_name
             FROM students st 
             JOIN classes c ON st.class_id = c.id 
             LEFT JOIN subprograms s ON c.subprogram_id = s.id
             LEFT JOIN programs p ON s.program_id = p.id
             WHERE st.student_id = ?`,
            `SELECT c.id, c.class_name, 1 as is_active,
                    COALESCE(s.subprogram_name, st.exam_type) as subprogram_name,
                    COALESCE(p.title, st.chosen_program, 'IELTS/TOEFL Program') as program_name
             FROM IELTSTOEFL st 
             JOIN classes c ON st.class_id = c.id 
             LEFT JOIN subprograms s ON c.subprogram_id = s.id
             LEFT JOIN programs p ON s.program_id = p.id
             WHERE st.student_id = ?`
        ];

        for (const q of profileQueries) {
            const [rows] = await dbp.query(q, [studentId]);
            console.log(`Query Success, rows: ${rows.length}`);
        }

        console.log("2. Testing History Query...");
        const [historyRows] = await dbp.query(
            `SELECT c.id, c.class_name, s.subprogram_name, p.title as program_name, sch.is_active
             FROM student_class_history sch
             JOIN classes c ON sch.class_id = c.id
             LEFT JOIN subprograms s ON c.subprogram_id = s.id
             LEFT JOIN programs p ON s.program_id = p.id
             WHERE sch.student_id = ?`,
            [studentId]
        );
        console.log(`Query Success, history rows: ${historyRows.length}`);

        console.log("3. Testing Submission Fallback Queries...");
        const submissionTables = ['exam_submissions', 'writing_task_submissions', 'course_work_submissions', 'oral_assignment_submissions'];
        const assignmentTables = ['exams', 'writing_tasks', 'course_work', 'oral_assignments'];

        for (let i = 0; i < submissionTables.length; i++) {
            console.log(`Checking ${submissionTables[i]}...`);
            const [subRows] = await dbp.query(
                `SELECT DISTINCT c.id, c.class_name, s.subprogram_name, p.title as program_name, 0 as is_active
                 FROM ${submissionTables[i]} sub
                 JOIN ${assignmentTables[i]} a ON sub.assignment_id = a.id
                 JOIN classes c ON a.class_id = c.id
                 LEFT JOIN subprograms s ON c.subprogram_id = s.id
                 LEFT JOIN programs p ON s.program_id = p.id
                 WHERE sub.student_id = ?`,
                [studentId]
            );
            console.log(`  Success, subRows: ${subRows.length}`);
        }

        console.log("✅ ALL QUERIES PASSED IN SCRIPT");
        process.exit(0);
    } catch (e) {
        console.error("❌ QUERY FAILED:");
        console.error(e);
        process.exit(1);
    }
}

debug();

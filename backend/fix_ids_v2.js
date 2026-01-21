import db from "./database/dbconfig.js";

const programAcronyms = {
    "8-Level General English Course for Adults": "GEP",
    "English For Specific Purposes Program": "ESP",
    "IELTS and TOEFL Test Preparation Courses": "IELTOEF",
    "Soft Skills and Workplace Training Programs": "SSWTP",
    "BEA Academic Writing Program": "AWP",
    "Digital Literacy and Virtual Communication": "DLVCS"
};

const formatDate = (date) => {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}${mm}${yy}`;
};

const fix_ids_v2 = async () => {
    try {
        const dbp = db.promise();
        console.log("Starting ID Fix Migration V2 (Temp ID anchored)...");
        await dbp.query("SET FOREIGN_KEY_CHECKS = 0");

        const affectedTables = ["IELTSTOEFL", "assignment_submissions", "attendance", "payments", "proficiency_test_submissions", "students", "test_submissions", "writing_task_submissions"];

        // 1. FIX TEACHERS
        console.log("Fixing Teacher IDs...");
        const [teachers] = await dbp.query("SELECT id, hire_date FROM teachers ORDER BY hire_date ASC, id ASC");
        let teacherCounter = 1;
        for (const t of teachers) {
            const dateStr = formatDate(t.hire_date || new Date());
            const newId = `BEA-TC-${dateStr}-${String(teacherCounter).padStart(3, '0')}`;
            await dbp.query("UPDATE teachers SET teacher_id = ? WHERE id = ?", [newId, t.id]);
            teacherCounter++;
        }

        // 2. FIX STUDENTS
        console.log("Fixing Student IDs...");
        const programCounters = {}; // acronym -> counter

        // Fetch all students with their temp_id
        const [regStudents] = await dbp.query("SELECT student_id, chosen_program, created_at, temp_id, 'students' as table_name FROM students");
        const [ieltsStudents] = await dbp.query("SELECT student_id, chosen_program, registration_date as created_at, temp_id, 'IELTSTOEFL' as table_name FROM IELTSTOEFL");

        const allStudents = [...regStudents, ...ieltsStudents].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        for (const s of allStudents) {
            const acronym = programAcronyms[s.chosen_program] || "GEN";
            programCounters[acronym] = (programCounters[acronym] || 100) + 1;

            const dateStr = formatDate(s.created_at || new Date());
            const newId = `BEA-ST-${acronym}-${dateStr}-${programCounters[acronym]}`;
            const oldId = s.student_id;

            console.log(`Migrating Row ${s.temp_id} (${s.table_name}): ${oldId} -> ${newId}`);

            // Update the source table row SPECIFICALLY using temp_id
            await dbp.query(`UPDATE ${s.table_name} SET student_id = ? WHERE temp_id = ?`, [newId, s.temp_id]);

            // Update all OTHER tables using the old student_id
            // Note: If multiple students shared the same oldId, they will all point to the same set of history.
            // This is unavoidable if there was no other unique link, but it's better than orphans.
            for (const table of affectedTables) {
                if (table === s.table_name) continue; // Already handled above more precisely
                try {
                    await dbp.query(`UPDATE ${table} SET student_id = ? WHERE student_id = ?`, [newId, oldId]);
                } catch (e) { }
            }
        }

        // 3. CLEANUP: REMOVE TEMP COLS
        console.log("Cleaning up temporary columns...");
        await dbp.query("ALTER TABLE students DROP COLUMN temp_id");
        await dbp.query("ALTER TABLE IELTSTOEFL DROP COLUMN temp_id");

        await dbp.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("Migration Complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
};

fix_ids_v2();

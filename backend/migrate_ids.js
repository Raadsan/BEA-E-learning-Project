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

const migrate = async () => {
    try {
        const dbp = db.promise();
        console.log("Starting ID Migration...");
        await dbp.query("SET FOREIGN_KEY_CHECKS = 0");

        // 1. MIGRATE TEACHERS
        console.log("Migrating Teacher IDs...");
        const [teachers] = await dbp.query("SELECT id, hire_date FROM teachers ORDER BY hire_date ASC, id ASC");

        const teacherCounters = {}; // DDMMYY -> counter
        for (const t of teachers) {
            const dateStr = formatDate(t.hire_date || new Date());
            teacherCounters[dateStr] = (teacherCounters[dateStr] || 0) + 1;
            const newId = `BEA-TC-${dateStr}-${String(teacherCounters[dateStr]).padStart(3, '0')}`;

            await dbp.query("UPDATE teachers SET teacher_id = ? WHERE id = ?", [newId, t.id]);
            console.log(`Updated Teacher ${t.id} -> ${newId}`);
        }

        // 2. MIGRATE STUDENTS
        console.log("Migrating Student IDs...");
        const affectedTables = ["IELTSTOEFL", "assignment_submissions", "attendance", "payments", "proficiency_test_submissions", "students", "test_submissions", "writing_task_submissions"];

        const [students] = await dbp.query("SELECT student_id, chosen_program, created_at FROM students ORDER BY created_at ASC");
        const [ieltsStudents] = await dbp.query("SELECT student_id, chosen_program, registration_date FROM IELTSTOEFL ORDER BY registration_date ASC");

        const studentCounters = {}; // prefix -> counter

        const migrateStudent = async (oldId, program, date, sourceTable) => {
            const acronym = programAcronyms[program] || "GEN";
            const dateStr = formatDate(date || new Date());
            const prefix = `BEA-ST-${acronym}-${dateStr}-`;

            studentCounters[prefix] = (studentCounters[prefix] || 100) + 1;
            const newId = `${prefix}${studentCounters[prefix]}`;

            console.log(`Migrating ${oldId} -> ${newId}`);

            // Update all tables
            for (const table of affectedTables) {
                // Check if table exists (just in case)
                try {
                    await dbp.query(`UPDATE ${table} SET student_id = ? WHERE student_id = ?`, [newId, oldId]);
                } catch (e) {
                    // Skip if table/column missing
                }
            }
        };

        // Migrate regular students
        for (const s of students) {
            await migrateStudent(s.student_id, s.chosen_program, s.created_at, "students");
        }

        // Migrate IELTS students
        for (const s of ieltsStudents) {
            await migrateStudent(s.student_id, s.chosen_program, s.registration_date, "IELTSTOEFL");
        }

        await dbp.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("Migration Complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
};

migrate();
burial: () => { }

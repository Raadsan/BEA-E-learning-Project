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

const final_migration = async () => {
    try {
        const dbp = db.promise();
        console.log("Starting Final ID Migration...");
        await dbp.query("SET FOREIGN_KEY_CHECKS = 0");

        // 1. DYNAMICALLY FIND TABLES WITH student_id
        console.log("Discovering tables with student_id...");
        const [tables] = await dbp.query('SHOW TABLES');
        const tableList = tables.map(r => Object.values(r)[0]);
        const affectedTables = [];
        for (const table of tableList) {
            const [columns] = await dbp.query(`DESCRIBE ${table}`);
            if (columns.some(c => c.Field === 'student_id')) {
                affectedTables.push(table);
                console.log(`- Expanding ${table}.student_id to VARCHAR(50)`);
                await dbp.query(`ALTER TABLE ${table} MODIFY student_id VARCHAR(50)`);
            }
        }

        console.log("Expanding teachers.teacher_id to VARCHAR(50)...");
        await dbp.query("ALTER TABLE teachers MODIFY teacher_id VARCHAR(50)");

        // 2. ENSURE TEMP IDS EXIST
        console.log("Ensuring temp_id exists for anchoring...");
        try { await dbp.query("ALTER TABLE students ADD COLUMN temp_id INT AUTO_INCREMENT UNIQUE"); } catch (e) { }
        try { await dbp.query("ALTER TABLE IELTSTOEFL ADD COLUMN temp_id INT AUTO_INCREMENT UNIQUE"); } catch (e) { }

        // 3. MIGRATE TEACHERS
        console.log("Migrating Teacher IDs...");
        const [teachers] = await dbp.query("SELECT id, hire_date FROM teachers ORDER BY hire_date ASC, id ASC");
        let teacherCounter = 1;
        for (const t of teachers) {
            const dateStr = formatDate(t.hire_date || new Date());
            const newId = `BEA-TC-${dateStr}-${String(teacherCounter).padStart(3, '0')}`;
            await dbp.query("UPDATE teachers SET teacher_id = ? WHERE id = ?", [newId, t.id]);
            teacherCounter++;
        }

        // 4. MIGRATE STUDENTS
        console.log("Migrating Student IDs...");
        const programCounters = {};

        const [regStudents] = await dbp.query("SELECT student_id, chosen_program, created_at, temp_id, 'students' as table_name FROM students");
        const [ieltsStudents] = await dbp.query("SELECT student_id, chosen_program, registration_date as created_at, temp_id, 'IELTSTOEFL' as table_name FROM IELTSTOEFL");

        const allStudents = [...regStudents, ...ieltsStudents].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        for (const s of allStudents) {
            const acronym = programAcronyms[s.chosen_program] || "GEN";
            programCounters[acronym] = (programCounters[acronym] || 100) + 1;

            const dateStr = formatDate(s.created_at || new Date());
            const newId = `BEA-ST-${acronym}-${dateStr}-${programCounters[acronym]}`;
            const oldId = s.student_id;

            console.log(`Row ${s.temp_id} in ${s.table_name}: ${oldId} -> ${newId}`);

            await dbp.query(`UPDATE ${s.table_name} SET student_id = ? WHERE temp_id = ?`, [newId, s.temp_id]);

            for (const table of affectedTables) {
                if (table === s.table_name) continue;
                try {
                    await dbp.query(`UPDATE ${table} SET student_id = ? WHERE student_id = ?`, [newId, oldId]);
                } catch (e) { }
            }
        }

        // 5. CLEANUP
        console.log("Dropping temporary columns...");
        try { await dbp.query("ALTER TABLE students DROP COLUMN temp_id"); } catch (e) { }
        try { await dbp.query("ALTER TABLE IELTSTOEFL DROP COLUMN temp_id"); } catch (e) { }

        await dbp.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("FINAL MIGRATION COMPLETE!");
    } catch (err) {
        console.error("Critical Migration Error:", err);
    } finally {
        process.exit(0);
    }
};

final_migration();

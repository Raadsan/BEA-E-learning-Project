import db from "./database/dbconfig.js";

const discover = async () => {
    try {
        const dbp = db.promise();
        const [tables] = await dbp.query('SHOW TABLES');
        const tableList = tables.map(r => Object.values(r)[0]);

        console.log("Table Relationships Check:");
        for (const table of tableList) {
            const [columns] = await dbp.query(`DESCRIBE ${table}`);
            const hasStudentId = columns.some(c => c.Field === 'student_id');
            const hasTeacherId = columns.some(c => c.Field === 'teacher_id');
            const hasTeacherInternalId = columns.some(c => c.Field === 'teacher_id_internal'); // Check for variants

            if (hasStudentId || hasTeacherId || hasTeacherInternalId) {
                console.log(`- Table: ${table} | student_id: ${hasStudentId} | teacher_id: ${hasTeacherId}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

discover();

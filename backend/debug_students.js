
import db from './database/dbconfig.js';

async function debugStudents() {
    const classId = 9;
    const [students] = await db.promise().query('SELECT id, full_name, class_id, status FROM students WHERE class_id = ?', [classId]);
    console.log(`Students in class ${classId}:`, students.length);
    console.log(students);

    const [allStudents] = await db.promise().query('SELECT id, full_name, class_id, status FROM students LIMIT 5');
    console.log('Sample All Students:', allStudents);

    process.exit();
}

debugStudents();

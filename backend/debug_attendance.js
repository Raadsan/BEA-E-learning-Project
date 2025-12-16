
import db from './database/dbconfig.js';

async function debug() {
    const [classes] = await db.promise().query('SELECT * FROM classes');
    console.log('Classes:', classes);

    const [attendance] = await db.promise().query('SELECT * FROM attendance');
    console.log('Total Attendance Records:', attendance.length);
    if (attendance.length > 0) console.log('Sample:', attendance[0]);

    const c322 = classes.find(c => c.class_name === 'c322');
    if (c322) {
        console.log('Found c322 ID:', c322.id);
        const [c322Data] = await db.promise().query('SELECT * FROM attendance WHERE class_id = ?', [c322.id]);
        console.log('c322 Data Count:', c322Data.length);
    } else {
        console.log('Class c322 not found');
    }
    process.exit();
}

debug();

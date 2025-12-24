import * as Student from './models/studentModel.js';

async function testModel() {
    try {
        const students = await Student.getAllStudents();
        console.log('Students count:', students.length);
        if (students.length > 0) {
            console.log('First student sample:');
            console.log('ID:', students[0].id);
            console.log('Full Name:', students[0].full_name);
            console.log('Approval Status:', students[0].approval_status);
            console.log('All keys:', Object.keys(students[0]));
        }
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testModel();

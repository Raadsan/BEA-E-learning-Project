import fetch from 'node-fetch';

async function testApi() {
    try {
        const res = await fetch('http://localhost:5000/api/students');
        const json = await res.json();
        console.log('Success:', json.success);
        if (json.students && json.students.length > 0) {
            console.log('First student sample:');
            console.log('ID:', json.students[0].id);
            console.log('Full Name:', json.students[0].full_name);
            console.log('Approval Status:', json.students[0].approval_status);
            console.log('All keys in first student:', Object.keys(json.students[0]));
        } else {
            console.log('No students found');
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testApi();

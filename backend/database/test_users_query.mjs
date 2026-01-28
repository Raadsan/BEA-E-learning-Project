import db from './dbconfig.js';

const dbp = db.promise();

async function testUsersAPI() {
    try {
        console.log('Testing the getAllUsers query...\n');

        // Admins
        const [admins] = await dbp.query("SELECT id, first_name, last_name, email, role, created_at FROM admins");
        console.log(`✓ Found ${admins.length} admins`);

        // Teachers
        const [teachers] = await dbp.query("SELECT id, full_name, email, created_at FROM teachers");
        console.log(`✓ Found ${teachers.length} teachers`);

        // Students
        const [students] = await dbp.query("SELECT student_id, full_name, email, approval_status as status, created_at FROM students");
        console.log(`✓ Found ${students.length} regular students`);

        // IELTS/TOEFL Students - FIXED QUERY
        const [ieltsStudents] = await dbp.query("SELECT student_id, CONCAT(first_name, ' ', last_name) as full_name, email, status, registration_date as created_at FROM IELTSTOEFL");
        console.log(`✓ Found ${ieltsStudents.length} IELTS/TOEFL students`);

        const totalUsers = admins.length + teachers.length + students.length + ieltsStudents.length;
        console.log(`\n✅ Total users: ${totalUsers}`);
        console.log('✅ All queries executed successfully!');

        if (ieltsStudents.length > 0) {
            console.log('\n📋 Sample IELTS/TOEFL student:');
            console.log(ieltsStudents[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testUsersAPI();

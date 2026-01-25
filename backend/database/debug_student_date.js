import db from './dbconfig.js';

async function checkStudent() {
    try {
        const [rows] = await db.promise().query("SELECT * FROM IELTSTOEFL WHERE first_name LIKE '%Hamuud%'");
        console.log(rows);
        if (rows.length > 0) {
            const student = rows[0];
            const regDateStr = student.registration_date;
            // Simulate frontend logic
            console.log("\n--- Frontend Logic Simulation ---");
            console.log("Raw DB Date:", regDateStr);

            const dateStr = new Date(regDateStr).toISOString().replace('T', ' ').replace('Z', ''); // Stringify roughly
            // Frontend receives JSON string usually
            const jsonDate = student.registration_date.toISOString ? student.registration_date.toISOString() : student.registration_date;
            console.log("JSON Date (likely sent to frontend):", jsonDate);

            // getSafeDate simulation
            const getSafeDate = (d) => {
                if (!d) return null;
                let s = d.toString();
                if (d instanceof Date) s = d.toISOString();
                const isoStr = s.includes('T') ? s : s.replace(' ', 'T');
                const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
                return new Date(finalStr);
            }

            const regDate = getSafeDate(jsonDate);
            console.log("Parsed regDate (Frontend):", regDate.toISOString());

            const now = new Date();
            console.log("Now (System):", now.toISOString());

            const hoursSinceReg = (now - regDate) / (1000 * 60 * 60);
            console.log("Hours Since Reg:", hoursSinceReg);
            console.log("Is Expired (> 0.1667):", hoursSinceReg > 0.1667);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudent();


import { getAttendanceStats } from './models/attendanceModel.js';
import db from './database/dbconfig.js';

async function verify() {
    console.log("Verifying getAttendanceStats...");
    try {
        const filters = {
            class_id: 9,
            program_id: 25, // Passing this to see if it triggers error
            startDate: '2020-12-16',
            endDate: '2025-12-16',
            period: 'daily'
        };
        const stats = await getAttendanceStats(filters);
        console.log("Stats fetched successfully:", stats.length);
        console.log("First row:", stats[0]);
    } catch (error) {
        console.error("Verification failed:", error.message);
        console.error("SQL:", error.sql);
    }
    process.exit();
}

verify();

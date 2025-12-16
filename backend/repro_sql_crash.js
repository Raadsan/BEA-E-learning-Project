
import * as Attendance from './models/attendanceModel.js';
import db from './database/dbconfig.js';

async function test() {
    try {
        console.log("Testing daily...");
        await Attendance.getAttendanceStats({
            class_id: null,
            program_id: null,
            startDate: '2024-01-01',
            endDate: '2025-12-31',
            period: 'daily'
        });
        console.log("Daily OK");

        console.log("Testing weekly...");
        await Attendance.getAttendanceStats({
            period: 'weekly',
            startDate: '2024-01-01',
            endDate: '2025-12-31'
        });
        console.log("Weekly OK");

        console.log("Testing monthly...");
        await Attendance.getAttendanceStats({
            period: 'monthly',
            startDate: '2024-01-01',
            endDate: '2025-12-31'
        });
        console.log("Monthly OK");

    } catch (e) {
        console.error("CRASH:", e.message);
        console.error("SQL State:", e.sqlState);
    }
    process.exit();
}

test();

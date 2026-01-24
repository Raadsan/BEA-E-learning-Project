
import db from '../database/dbconfig.js';
import { sendNotification } from '../utils/emailService.js';

const dbp = db.promise();

/**
 * Check for students who have 5 minutes left in their 24h window
 * Window: [23h 55m since registration, 23h 59m since registration]
 */
export const checkProficiencyDeadlines = async () => {
    try {
        // Find Pending IELTSTOEFL students who haven't been sent a reminder
        const [students] = await dbp.query(`
            SELECT student_id, first_name, last_name, email, registration_date 
            FROM IELTSTOEFL 
            WHERE status = 'Pending' AND reminder_sent = FALSE
        `);

        if (students.length === 0) return;

        const now = new Date();
        const triggerTimeMs = 23 * 60 * 60 * 1000 + 55 * 60 * 1000; // 23h 55m
        const deadlineMs = 24 * 60 * 60 * 1000; // 24h

        for (const student of students) {
            const regDate = new Date(student.registration_date);
            const timeDiff = now - regDate;

            // If they are in the reminder window (23h 55m to 24h)
            if (timeDiff >= triggerTimeMs && timeDiff < deadlineMs) {
                console.log(`⏰ Sending 5-minute reminder to ${student.email} (${student.student_id})`);

                const emailContent = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #d32f2f;">Urgent: Proficiency Test Reminder</h2>
                        <p>Dear ${student.first_name} ${student.last_name},</p>
                        <p>You have exactly <strong>5 minutes remaining</strong> to enter your proficiency test to approve your program and get assigned to your classes.</p>
                        <p>Please log in to your dashboard immediately and complete the test to avoid being blocked from the system.</p>
                        <hr />
                        <p style="font-size: 0.8em; color: #777;">This is an automated reminder from BEA E-Learning Portal.</p>
                    </div>
                `;

                try {
                    await sendNotification({
                        to: student.email,
                        subject: "Urgent: 5 Minutes to enter your Proficiency Test",
                        html: emailContent
                    });

                    // Mark as sent
                    await dbp.query(
                        "UPDATE IELTSTOEFL SET reminder_sent = TRUE WHERE student_id = ?",
                        [student.student_id]
                    );
                    console.log(`✅ Reminder marked as sent for ${student.student_id}`);
                } catch (emailErr) {
                    console.error(`❌ Failed to send reminder to ${student.email}:`, emailErr);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error in checkProficiencyDeadlines worker:", error);
    }
};

/**
 * Start the monitoring interval
 */
export const startReminderWorker = () => {
    console.log("🚀 Proficiency Test Reminder Worker started (checking every minute)");
    // Check every minute
    setInterval(checkProficiencyDeadlines, 60000);
};

export default { startReminderWorker };


import db from '../database/dbconfig.js';
import { sendNotification } from '../utils/emailService.js';
import { createNotificationInternal } from '../controllers/notificationController.js';

const dbp = db.promise();

/**
 * Check for students who have a critical amount of time left in their entry window
 */
export const checkProficiencyDeadlines = async () => {
    try {
        // Optimized Query: ONLY fetch students who are in the 6-minute reminder window before their expiry
        // Window: expiry_date is between NOW() and NOW() + 6 minutes
        // (Ensures the alert is sent as they enter the 5-minute range at approximately 5:59)
        const [students] = await dbp.query(`
            SELECT i.student_id, i.first_name, i.last_name, i.email, i.expiry_date 
            FROM IELTSTOEFL i
            LEFT JOIN proficiency_test_results r ON i.student_id = r.student_id
            WHERE i.status = 'Pending' 
              AND i.reminder_sent = FALSE
              AND r.id IS NULL
              AND i.expiry_date <= NOW() + INTERVAL 6 MINUTE
              AND i.expiry_date > NOW()
        `);

        if (students.length === 0) return;

        for (const student of students) {
            console.log(`⏰ Sending critical entry reminder to ${student.email} (${student.student_id})`);

            const emailContent = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #d32f2f;">Urgent: Proficiency Test Entry Reminder</h2>
                    <p>Dear ${student.first_name} ${student.last_name},</p>
                    <p>You have <strong>less than 6 minutes remaining</strong> to enter your proficiency test.</p>
                    <p>Please log in to your dashboard immediately and start the test now to avoid being blocked from entry.</p>
                    <hr />
                    <p style="font-size: 0.8em; color: #777;">This is an automated priority reminder from BEA English Academy.</p>
                </div>
            `;

            try {
                // 1. Send Email
                await sendNotification({
                    to: student.email,
                    subject: "URGENT: Final Minutes to Enter Your Proficiency Test",
                    html: emailContent
                });

                // 2. Send System Notification
                await createNotificationInternal({
                    user_id: student.student_id,
                    sender_id: 'SYSTEM',
                    type: 'deadline_reminder',
                    title: 'Urgent: Proficiency Test Deadline',
                    message: 'You have less than 6 minutes remaining to enter the proficiency test. Start now!',
                    metadata: {
                        deadline_type: 'proficiency_test',
                        remaining_minutes: 6
                    }
                });

                // 3. Mark as sent
                await dbp.query(
                    "UPDATE IELTSTOEFL SET reminder_sent = TRUE WHERE student_id = ?",
                    [student.student_id]
                );
                console.log(`✅ Critical reminder sent for ${student.student_id}`);
            } catch (err) {
                console.error(`❌ Failed to process reminder for ${student.email}:`, err);
            }
        }

        // --- PART 2: NOTIFY ADMINS ABOUT EXPIRED STUDENTS ---
        const [expiredStudents] = await dbp.query(`
            SELECT i.student_id, i.first_name, i.last_name, i.expiry_date 
            FROM IELTSTOEFL i
            LEFT JOIN proficiency_test_results r ON i.student_id = r.student_id
            WHERE i.status = 'Pending' 
              AND i.admin_expiry_notified = FALSE
              AND r.id IS NULL
              AND i.expiry_date < NOW()
        `);

        if (expiredStudents.length > 0) {
            const [admins] = await dbp.query("SELECT id FROM admins");

            for (const student of expiredStudents) {
                console.log(`🚨 Notifying admins about expiry for ${student.student_id}`);

                for (const admin of admins) {
                    try {
                        await createNotificationInternal({
                            user_id: admin.id,
                            sender_id: 'SYSTEM',
                            type: 'student_expiry_alert',
                            title: 'Student Test Window Expired',
                            message: `Student ${student.first_name} ${student.last_name} (${student.student_id}) missed their entry window.`,
                            metadata: {
                                expired_student_id: student.student_id,
                                expiry_date: student.expiry_date
                            }
                        });
                    } catch (err) {
                        console.error(`❌ Failed to notify admin ${admin.id}:`, err);
                    }
                }
                await dbp.query("UPDATE IELTSTOEFL SET admin_expiry_notified = TRUE WHERE student_id = ?", [student.student_id]);
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
    setInterval(checkProficiencyDeadlines, 60000);
};

export default { startReminderWorker };

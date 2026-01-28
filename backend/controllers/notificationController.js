
import db from "../database/dbconfig.js";

const dbp = db.promise();

// Create a notification
export const createNotification = async (req, res) => {
    try {
        const { user_id, sender_id, type, title, message, metadata } = req.body;

        if (!type || !title) {
            return res.status(400).json({ error: "Type and title are required" });
        }

        const [result] = await dbp.query(
            `INSERT INTO notifications (user_id, sender_id, type, title, message, metadata) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id || null, sender_id || null, type, title, message || "", JSON.stringify(metadata || {})]
        );

        const [newNotif] = await dbp.query("SELECT * FROM notifications WHERE id = ?", [result.insertId]);

        res.status(201).json({ message: "Notification created", notification: newNotif[0] });
    } catch (err) {
        console.error("Create notification error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Internal function to create notification without req/res (for use in other controllers)
export const createNotificationInternal = async ({ user_id, sender_id, type, title, message, metadata }) => {
    try {
        const [result] = await dbp.query(
            `INSERT INTO notifications (user_id, sender_id, type, title, message, metadata) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id || null, sender_id || null, type, title, message || "", JSON.stringify(metadata || {})]
        );
        return result.insertId;
    } catch (err) {
        console.error("Internal create notification error:", err);
        return null; // Don't crash the main flow if notification fails
    }
};

// Get all notifications (Admin view)
// TODO: Filtering by user_id if needed. For now, we fetch all for admin.
export const getNotifications = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let query;
        let params = [];

        if (role === 'admin') {
            // Admin sees system notifications (user_id NULL) or specifically for them
            query = `
                SELECT n.*, s.full_name as sender_name
                FROM notifications n
                LEFT JOIN students s ON n.sender_id = s.student_id AND n.sender_id IS NOT NULL
                WHERE n.user_id IS NULL OR n.user_id = ?
                ORDER BY n.created_at DESC
            `;
            params = [userId];
        } else {
            // Student/Teacher only sees notifications specifically for them
            query = `
                SELECT n.*, NULL as sender_name
                FROM notifications n
                WHERE n.user_id = ?
                ORDER BY n.created_at DESC
            `;
            params = [userId];
        }

        const [rows] = await dbp.query(query, params);

        // Also try to join teachers if sender could be teacher?
        // Optimization: If sender_id refers to 'users' table or mixed tables, the join is tricky.
        // Assuming sender is mostly Student for this specific feature.

        res.json(rows);
    } catch (err) {
        console.error("Get notifications error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Mark as Read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await dbp.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
        res.json({ message: "Marked as read" });
    } catch (err) {
        console.error("Mark read error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// Delete
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await dbp.query("DELETE FROM notifications WHERE id = ?", [id]);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("Delete notification error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// Send automated email reminder for low test time
import { sendNotification } from "../utils/emailService.js";
export const sendTestReminderEmail = async (req, res) => {
    try {
        const { email, testTitle, studentName, remainingTime = "5:59" } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; rounded-lg;">
                <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">🕒 Urgent: Test Time Running Out!</h2>
                <p>Dear ${studentName || 'Student'},</p>
                <p>This is an automated reminder that you have <strong>${remainingTime}</strong> remaining for your <strong style="color: #010080;">${testTitle || 'current test'}</strong>.</p>
                <div style="background-color: #fff4f4; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #d32f2f; font-weight: bold;">Action Required:</p>
                    <p style="margin: 5px 0 0 0;">Please ensure you complete and submit your answers before the timer reaches zero to ensure your progress is saved.</p>
                </div>
                <p>If you have already submitted, please ignore this message.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 0.8em; color: #777; text-align: center;">This is an automated priority reminder from BEA English Academy.</p>
            </div>
        `;

        await sendNotification({
            to: email,
            subject: `URGENT: ${remainingTime} Remaining for ${testTitle || 'Your Test'}`,
            html: emailContent
        });

        res.status(200).json({ success: true, message: "Reminder email sent" });
    } catch (error) {
        console.error("Error sending test reminder email:", error);
        res.status(500).json({ error: "Failed to send reminder email" });
    }
};


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
        // If we want to filter by specific admin user:
        // const { userId } = req.user;

        // Fetch notifications. Join with sender info (students/teachers) if possible.
        // For now, simple fetch.
        const [rows] = await dbp.query(
            `SELECT n.*, 
            s.full_name as sender_name
         FROM notifications n
         LEFT JOIN students s ON n.sender_id = s.id AND n.sender_id IS NOT NULL
         ORDER BY n.created_at DESC`
        );

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

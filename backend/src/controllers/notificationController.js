import prisma from '../lib/prisma.js';
import { sendNotification } from "../utils/emailService.js";

// Create a notification
export const createNotification = async (req, res) => {
    try {
        const { user_id, sender_id, type, title, message, metadata } = req.body;
        if (!type || !title) return res.status(400).json({ error: "Type and title are required" });

        const notification = await prisma.notifications.create({
            data: {
                user_id: user_id || null,
                sender_id: sender_id || null,
                type, title,
                message: message || "",
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
        res.status(201).json({ message: "Notification created", notification });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Internal function
export const createNotificationInternal = async ({ user_id, sender_id, type, title, message, metadata }) => {
    try {
        await prisma.notifications.create({
            data: {
                user_id: user_id || null,
                sender_id: sender_id || null,
                type, title,
                message: message || "",
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    } catch (err) {
        console.error("Internal create notification error:", err);
    }
};

// Get notifications
export const getNotifications = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userIdStr = String(userId);
        const where = role === 'admin' 
            ? { OR: [{ user_id: null }, { user_id: userIdStr }] }
            : { user_id: userIdStr };

        const notifications = await prisma.notifications.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        // Resolve sender_name and sender_image dynamically
        const populated = await Promise.all(notifications.map(async (n) => {
            const senderId = n.sender_id;
            let sender_name = 'System';
            let sender_image = null;

            if (senderId && senderId !== 'SYSTEM') {
                if (senderId.startsWith('BEA-ST-')) {
                    // It's a student
                    const student = await prisma.students.findUnique({
                        where: { student_id: senderId }
                    });
                    if (student) {
                        sender_name = student.full_name || 'Student';
                        sender_image = student.profile_picture || null;
                    }
                } else {
                    // Try to parse as integer admin id
                    const adminId = parseInt(senderId);
                    if (!isNaN(adminId)) {
                        const admin = await prisma.admins.findUnique({
                            where: { id: adminId }
                        });
                        if (admin) {
                            sender_name = admin.first_name ? `${admin.first_name} ${admin.last_name || ''}`.trim() : admin.username;
                            sender_image = admin.profile_picture || admin.profile_image || null;
                        }
                    }
                }
            }

            return {
                ...n,
                sender_name,
                sender_image
            };
        }));

        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark as read
export const markAsRead = async (req, res) => {
    try {
        await prisma.notifications.update({
            where: { id: parseInt(req.params.id) },
            data: { is_read: true }
        });
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete
export const deleteNotification = async (req, res) => {
    try {
        await prisma.notifications.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send email reminder
export const sendTestReminderEmail = async (req, res) => {
    try {
        const { email, testTitle, studentName, remainingTime = "5:59" } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const emailContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #d32f2f;">🕒 Urgent: Test Time Running Out!</h2>
                <p>Dear ${studentName || 'Student'},</p>
                <p>You have <strong>${remainingTime}</strong> remaining for your <strong>${testTitle || 'test'}</strong>.</p>
                <p>Please ensure you submit before the timer reaches zero.</p>
            </div>
        `;

        await sendNotification({
            to: email,
            subject: `URGENT: ${remainingTime} Remaining`,
            html: emailContent
        });

        res.json({ success: true, message: "Email sent" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

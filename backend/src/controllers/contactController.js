import prisma from '../lib/prisma.js';
import { sendNotification } from "../utils/emailService.js";

const defaultContactPage = {
    id: 1,
    hero_title: "Get In Touch With Us",
    hero_subtitle: "We're here to help you 24/7",
    hero_description: "Have questions about our courses, need support, or want to discuss your learning goals? Our team is ready to assist you on your educational journey.",
    address: "HQ: Taleex, Hodan District, Mogadishu, Somalia",
    phone: "+252 61 123-4567",
    email: "admission@beaportal.com",
    social_links: { facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "", telegram: "", tiktok: "" },
    schedule_title: "Operational Schedule",
    schedule_description: "If you were wondering how many days or hours we work, here is our day-to-day operational schedule for your reference.",
    schedule: [
        { day: "Saturday", hours: "9:00 AM - 6:00 PM" }, { day: "Sunday", hours: "9:00 AM - 6:00 PM" },
        { day: "Monday", hours: "9:00 AM - 6:00 PM" }, { day: "Tuesday", hours: "9:00 AM - 6:00 PM" },
        { day: "Wednesday", hours: "9:00 AM - 6:00 PM" }, { day: "Thursday", hours: "10:00 AM - 4:00 PM" },
        { day: "Friday", hours: "Closed" },
    ],
};

export const getContactPage = async (_req, res) => {
    try {
        const settings = await prisma.contact_page_settings.findUnique({ where: { id: 1 } });
        res.json(settings || defaultContactPage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateContactPage = async (req, res) => {
    try {
        const data = req.body;
        const required = ["hero_title", "hero_subtitle", "hero_description", "address", "phone", "email", "schedule_title", "schedule_description"];
        if (required.some((key) => !String(data[key] || "").trim()) || !Array.isArray(data.schedule)) {
            return res.status(400).json({ error: "Complete all contact-page fields and schedule rows." });
        }
        const payload = {
            hero_title: data.hero_title.trim(), hero_subtitle: data.hero_subtitle.trim(), hero_description: data.hero_description.trim(),
            address: data.address.trim(), phone: data.phone.trim(), email: data.email.trim(),
            social_links: data.social_links || {}, schedule_title: data.schedule_title.trim(),
            schedule_description: data.schedule_description.trim(),
            schedule: data.schedule.map((row) => ({ day: String(row.day || "").trim(), hours: String(row.hours || "").trim() })),
        };
        const settings = await prisma.contact_page_settings.upsert({ where: { id: 1 }, create: { id: 1, ...payload }, update: payload });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ error: "Missing fields" });

        const contact = await prisma.contacts.create({
            data: { name, email, phone, message }
        });

        const html = `<h2>New Contact Inquiry</h2><p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`;
        await sendNotification({
            to: process.env.EMAIL_USER,
            subject: `Contact from ${name}`,
            html
        });

        res.status(201).json({ success: true, contact });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getContacts = async (req, res) => {
    try {
        const contacts = await prisma.contacts.findMany({ orderBy: { created_at: 'desc' } });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteContact = async (req, res) => {
    try {
        await prisma.contacts.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createSupportRequest = async (req, res) => {
    try {
        const student_id = String(req.user.userId);
        const { category, subject, message } = req.body;
        if (!category?.trim() || !subject?.trim() || !message?.trim()) return res.status(400).json({ error: "Category, subject and message are required" });
        const request = await prisma.student_support_requests.create({ data: { student_id, category: category.trim(), subject: subject.trim(), message: message.trim() } });
        await prisma.notifications.create({ data: { user_id: null, sender_id: student_id, type: "student_support", title: "New student support request", message: subject.trim(), metadata: { support_request_id: request.id, path: "/portal/admin/communication/student-support" } } });
        res.status(201).json(request);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMySupportRequests = async (req, res) => {
    try { res.json(await prisma.student_support_requests.findMany({ where: { student_id: String(req.user.userId) }, orderBy: { created_at: "desc" } })); }
    catch (err) { res.status(500).json({ error: err.message }); }
};

export const getSupportRequests = async (_req, res) => {
    try {
        const requests = await prisma.student_support_requests.findMany({ orderBy: { created_at: "desc" } });
        const studentIds = [...new Set(requests.map((item) => item.student_id))];
        const students = await prisma.students.findMany({ where: { student_id: { in: studentIds } }, select: { student_id: true, full_name: true, email: true } });
        const studentMap = new Map(students.map((student) => [student.student_id, student]));
        res.json(requests.map((item) => ({ ...item, student: studentMap.get(item.student_id) || null })));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const replySupportRequest = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10); const reply = String(req.body.reply || "").trim();
        if (!reply) return res.status(400).json({ error: "Reply message is required" });
        const existing = await prisma.student_support_requests.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "Support request not found" });
        const updated = await prisma.student_support_requests.update({ where: { id }, data: { admin_reply: reply, status: "answered", replied_by: parseInt(req.user.userId, 10) || null, replied_at: new Date() } });
        await prisma.notifications.create({ data: { user_id: existing.student_id, sender_id: String(req.user.userId), type: "support_reply", title: "Support team replied", message: reply, metadata: { support_request_id: id, path: "/portal/student/student-support" } } });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteSupportRequest = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prisma.student_support_requests.delete({ where: { id } });
        res.json({ message: "Support request deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
import prisma from '../lib/prisma.js';
import { sendNotification } from "../utils/emailService.js";

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

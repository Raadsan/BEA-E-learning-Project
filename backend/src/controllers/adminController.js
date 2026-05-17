import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

export const getAdmins = async (req, res) => {
    try {
        const admins = await prisma.admins.findMany({
            select: { id: true, email: true, full_name: true, first_name: true, last_name: true, username: true, phone: true, role: true, status: true, profile_picture: true, created_at: true }
        });
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAdmin = async (req, res) => {
    try {
        const admin = await prisma.admins.findUnique({
            where: { id: parseInt(req.params.id) },
            select: { id: true, email: true, full_name: true, first_name: true, last_name: true, username: true, phone: true, role: true, status: true, profile_picture: true }
        });
        if (!admin) return res.status(404).json({ error: 'Not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { full_name, first_name, last_name, username, email, password, phone, role } = req.body;
        const names = (full_name || '').split(' ');
        const fName = first_name || names[0] || '';
        const lName = last_name || names.slice(1).join(' ') || '';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await prisma.admins.create({
            data: { first_name: fName, last_name: lName, full_name: full_name || `${fName} ${lName}`.trim(), username, email, password: hashedPassword, phone, role: role || 'admin' }
        });
        const { password: _, ...safeAdmin } = admin;
        res.status(201).json(safeAdmin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) data.profile_picture = `/uploads/${req.file.filename}`;
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        } else {
            delete data.password;
        }
        const updated = await prisma.admins.update({
            where: { id: parseInt(req.params.id) },
            data,
            select: { id: true, email: true, full_name: true, first_name: true, last_name: true, username: true, phone: true, role: true, profile_picture: true }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        await prisma.admins.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

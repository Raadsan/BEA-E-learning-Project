import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validateEmailRobust } from '../utils/emailValidator.js';
import { validatePassword, passwordPolicyMessage } from '../utils/passwordValidator.js';
import {
    isSuperAdminRole,
    parseAdminPermissions,
    serializeAdminPermissions,
    validateTechnicalPermissions,
} from '../utils/adminPermissions.js';
import { sendTechnicalAdminCredentials } from '../utils/emailService.js';

function getActorAdminId(req) {
    const rawId = req.user?.userId ?? req.user?.id;
    const id = parseInt(rawId, 10);
    return Number.isNaN(id) ? null : id;
}

async function getActorAdmin(req) {
    const id = getActorAdminId(req);
    if (!id) return null;
    return prisma.admins.findUnique({
        where: { id },
        select: { id: true, full_name: true, username: true, email: true },
    });
}

function formatAdminName(admin) {
    if (!admin) return null;
    return admin.full_name || admin.username || admin.email || `Admin #${admin.id}`;
}

async function enrichAdmins(admins) {
    const relatedIds = new Set();
    for (const admin of admins) {
        if (admin.created_by) relatedIds.add(admin.created_by);
        if (admin.updated_by) relatedIds.add(admin.updated_by);
    }

    let nameById = {};
    if (relatedIds.size > 0) {
        const relatedAdmins = await prisma.admins.findMany({
            where: { id: { in: [...relatedIds] } },
            select: { id: true, full_name: true, username: true, email: true },
        });
        nameById = Object.fromEntries(
            relatedAdmins.map((item) => [item.id, formatAdminName(item)])
        );
    }

    return admins.map((admin) => ({
        ...buildSafeAdmin(admin),
        created_by_name:
            admin.created_by_name ||
            (admin.created_by ? nameById[admin.created_by] : null) ||
            "Not recorded",
        updated_by_name:
            admin.updated_by_name ||
            (admin.updated_by ? nameById[admin.updated_by] : null) ||
            null,
    }));
}

function buildSafeAdmin(admin) {
    const { password: _, ...safeAdmin } = admin;
    return {
        ...safeAdmin,
        permissions: parseAdminPermissions(admin.permissions),
    };
}

function generateTechnicalAdminPassword() {
    const base = crypto.randomBytes(6).toString('base64url');
    return `Bea@${base}1`;
}

export const getAdmins = async (req, res) => {
    try {
        await prisma.admins.updateMany({
            where: { created_by: null, created_by_name: null },
            data: { created_by_name: "Not recorded" },
        });

        const admins = await prisma.admins.findMany({
            select: {
                id: true, email: true, full_name: true, first_name: true, last_name: true,
                username: true, phone: true, role: true, status: true, profile_picture: true,
                permissions: true, created_at: true, updated_at: true,
                created_by: true, updated_by: true,
                created_by_name: true, updated_by_name: true,
            },
            orderBy: { created_at: 'desc' },
        });
        res.json(await enrichAdmins(admins));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAdmin = async (req, res) => {
    try {
        const admin = await prisma.admins.findUnique({
            where: { id: parseInt(req.params.id) },
            select: {
                id: true, email: true, full_name: true, first_name: true, last_name: true,
                username: true, phone: true, role: true, status: true, profile_picture: true,
                permissions: true, created_at: true, updated_at: true,
                created_by: true, updated_by: true,
                created_by_name: true, updated_by_name: true,
            }
        });
        if (!admin) return res.status(404).json({ error: 'Not found' });
        const [enriched] = await enrichAdmins([admin]);
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { full_name, first_name, last_name, username, email, password, phone, role, permissions } = req.body;
        const adminRole = role || 'super';

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailStr = email.trim().toLowerCase();
        const emailValidationResult = await validateEmailRobust(emailStr);
        if (!emailValidationResult.valid) {
            return res.status(400).json({ error: emailValidationResult.message || "Invalid email address. Please provide a real and working email." });
        }

        const names = (full_name || '').split(' ');
        const fName = first_name || names[0] || '';
        const lName = last_name || names.slice(1).join(' ') || '';

        let plainPassword = password;
        let permissionsJson = null;

        if (adminRole === 'technical') {
            const permissionCheck = validateTechnicalPermissions(permissions);
            if (!permissionCheck.valid) {
                return res.status(400).json({ error: permissionCheck.error });
            }
            permissionsJson = serializeAdminPermissions(permissionCheck.permissions);
            plainPassword = generateTechnicalAdminPassword();
        } else {
            if (!plainPassword) {
                return res.status(400).json({ error: "Password is required for Super Admin" });
            }
            if (!validatePassword(plainPassword)) {
                return res.status(400).json({ error: passwordPolicyMessage });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const actor = await getActorAdmin(req);

        const admin = await prisma.admins.create({
            data: {
                first_name: fName,
                last_name: lName,
                full_name: full_name || `${fName} ${lName}`.trim(),
                username,
                email: emailStr,
                password: hashedPassword,
                phone,
                role: adminRole,
                permissions: permissionsJson,
                created_by: actor?.id || null,
                created_by_name: actor ? formatAdminName(actor) : "Not recorded",
            }
        });

        if (adminRole === 'technical') {
            try {
                await sendTechnicalAdminCredentials({
                    to: emailStr,
                    name: admin.full_name,
                    email: emailStr,
                    password: plainPassword,
                });
            } catch (emailErr) {
                console.error('Failed to email technical admin credentials:', emailErr);
            }
        }

        res.status(201).json((await enrichAdmins([admin]))[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);
        const existing = await prisma.admins.findUnique({ where: { id: adminId } });
        if (!existing) return res.status(404).json({ error: 'Not found' });

        const data = { ...req.body };
        delete data.confirmPassword;
        delete data.id;
        delete data.created_by;
        delete data.created_by_name;
        delete data.updated_by;
        delete data.updated_by_name;

        if (req.file) data.profile_picture = `/uploads/${req.file.filename}`;

        const nextRole = data.role || existing.role || 'super';
        if (nextRole === 'technical' || existing.role === 'technical') {
            delete data.password;
            if (data.permissions !== undefined) {
                const permissionCheck = validateTechnicalPermissions(data.permissions);
                if (!permissionCheck.valid) {
                    return res.status(400).json({ error: permissionCheck.error });
                }
                data.permissions = serializeAdminPermissions(permissionCheck.permissions);
            }
        } else if (data.password) {
            if (!validatePassword(data.password)) {
                return res.status(400).json({ error: passwordPolicyMessage });
            }
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        } else {
            delete data.password;
        }

        if (isSuperAdminRole(nextRole)) {
            data.permissions = null;
        }

        const actor = await getActorAdmin(req);
        data.updated_by = actor?.id || null;
        data.updated_by_name = actor ? formatAdminName(actor) : null;
        data.updated_at = new Date();

        const updated = await prisma.admins.update({
            where: { id: adminId },
            data,
            select: {
                id: true, email: true, full_name: true, first_name: true, last_name: true,
                username: true, phone: true, role: true, status: true, profile_picture: true,
                permissions: true, created_at: true, updated_at: true,
                created_by: true, updated_by: true,
                created_by_name: true, updated_by_name: true,
            }
        });
        res.json((await enrichAdmins([updated]))[0]);
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

export const bulkActionAdmins = async (req, res) => {
    const { adminIds, action } = req.body;
    if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
        return res.status(400).json({ error: "Admin IDs must be a non-empty array" });
    }
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }

    try {
        const actor = await getActorAdmin(req);
        await prisma.$transaction(async (tx) => {
            for (const adminId of adminIds) {
                const numericId = parseInt(adminId, 10);
                if (isNaN(numericId)) continue;

                if (action === 'delete') {
                    await tx.admins.delete({ where: { id: numericId } });
                } else {
                    await tx.admins.update({
                        where: { id: numericId },
                        data: {
                            status: action === 'activate' ? 'active' : 'inactive',
                            updated_by: actor?.id || null,
                            updated_by_name: actor ? formatAdminName(actor) : null,
                            updated_at: new Date(),
                        }
                    });
                }
            }
        });
        res.json({ message: `Bulk action ${action} completed successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

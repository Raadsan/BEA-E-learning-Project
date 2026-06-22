import prisma from '../lib/prisma.js';
import {
    GLOBAL_CERTIFICATE_TARGET_ID,
    GLOBAL_CERTIFICATE_TARGET_TYPE,
    normalizeFieldsConfig,
} from '../utils/certificateFields.js';
import {
    buildCreateAudit,
    buildUpdateAudit,
    enrichWithAudit,
    backfillMissingCreatedBy,
} from '../utils/auditTrail.js';

const globalTemplateWhere = {
    target_id: GLOBAL_CERTIFICATE_TARGET_ID,
    target_type: GLOBAL_CERTIFICATE_TARGET_TYPE,
};

function mapCertificate(cert, admins) {
    if (!cert) return null;
    const admin = admins.find((a) => a.id === cert.uploader_id || a.id === cert.created_by);
    const adminName = cert.created_by_name || (admin
        ? (admin.full_name || admin.username || admin.email)
        : 'Not recorded');

    return {
        ...cert,
        fields_config: normalizeFieldsConfig(cert.fields_config, cert),
        uploaded_by: adminName,
        created_by_name: adminName,
        is_global: cert.target_id === GLOBAL_CERTIFICATE_TARGET_ID && cert.target_type === GLOBAL_CERTIFICATE_TARGET_TYPE,
    };
}

export const getCertificates = async (req, res) => {
    try {
        await backfillMissingCreatedBy(prisma.certificates);
        const certs = await prisma.certificates.findMany({ orderBy: { created_at: 'desc' } });
        const admins = await prisma.admins.findMany({
            select: { id: true, first_name: true, last_name: true, username: true, full_name: true, email: true },
        });

        const enriched = await enrichWithAudit(certs);
        res.json(enriched.map((cert) => mapCertificate(cert, admins)));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getGlobalCertificate = async (req, res) => {
    try {
        const cert = await prisma.certificates.findFirst({ where: globalTemplateWhere });
        if (!cert) return res.json(null);

        const admins = await prisma.admins.findMany({
            select: { id: true, first_name: true, last_name: true, username: true, full_name: true, email: true },
        });

        res.json(mapCertificate(await enrichWithAudit(cert), admins));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCertificateByTarget = async (req, res) => {
    try {
        const { target_type, target_id } = req.params;
        const cert = await prisma.certificates.findFirst({
            where: { target_id: parseInt(target_id), target_type },
        });
        if (!cert) return res.json(null);

        const admins = await prisma.admins.findMany({
            select: { id: true, first_name: true, last_name: true, username: true, full_name: true, email: true },
        });

        res.json(mapCertificate(await enrichWithAudit(cert), admins));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const upsertCertificate = async (req, res) => {
    try {
        const {
            target_id,
            target_type,
            template_url,
            name_x,
            name_y,
            font_size,
            font_color,
            fields_config,
            is_global,
        } = req.body;

        const resolvedTargetId = is_global
            ? GLOBAL_CERTIFICATE_TARGET_ID
            : parseInt(target_id);
        const resolvedTargetType = is_global
            ? GLOBAL_CERTIFICATE_TARGET_TYPE
            : target_type;

        const normalizedFields = normalizeFieldsConfig(fields_config, {
            name_x,
            name_y,
            font_size,
            font_color,
        });

        const existing = await prisma.certificates.findFirst({
            where: {
                target_id: resolvedTargetId,
                target_type: resolvedTargetType,
            },
        });

        const createAudit = existing ? await buildUpdateAudit(req) : await buildCreateAudit(req, 'System');
        const actorId = req.user?.userId ? parseInt(req.user.userId, 10) : null;

        const payload = {
            template_url,
            name_x: normalizedFields.student_name.x,
            name_y: normalizedFields.student_name.y,
            font_size: normalizedFields.student_name.font_size,
            font_color: normalizedFields.student_name.font_color,
            fields_config: normalizedFields,
            uploader_id: actorId,
            ...createAudit,
        };

        await prisma.certificates.upsert({
            where: {
                target_id_target_type: {
                    target_id: resolvedTargetId,
                    target_type: resolvedTargetType,
                },
            },
            update: payload,
            create: {
                target_id: resolvedTargetId,
                target_type: resolvedTargetType,
                ...payload,
            },
        });

        res.json({ message: 'Certificate saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteCertificate = async (req, res) => {
    try {
        await prisma.certificates.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

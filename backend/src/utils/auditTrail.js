import prisma from '../lib/prisma.js';

export function getActorAdminId(req) {
    const rawId = req?.user?.userId ?? req?.user?.id;
    const id = parseInt(rawId, 10);
    return Number.isNaN(id) ? null : id;
}

export async function getActorAdmin(req) {
    const id = getActorAdminId(req);
    if (!id) return null;
    return prisma.admins.findUnique({
        where: { id },
        select: { id: true, full_name: true, username: true, email: true },
    });
}

export function formatAdminName(admin) {
    if (!admin) return null;
    return admin.full_name || admin.username || admin.email || `Admin #${admin.id}`;
}

export async function buildCreateAudit(req, selfRegistrationLabel = 'Self registration') {
    const actor = await getActorAdmin(req);
    if (actor) {
        const name = formatAdminName(actor);
        return {
            created_by: actor.id,
            created_by_name: name,
            updated_by: null,
            updated_by_name: null,
        };
    }
    return {
        created_by: null,
        created_by_name: selfRegistrationLabel,
        updated_by: null,
        updated_by_name: null,
    };
}

export async function buildUpdateAudit(req) {
    const actor = await getActorAdmin(req);
    if (!actor) return {};
    return {
        updated_by: actor.id,
        updated_by_name: formatAdminName(actor),
    };
}

export async function enrichWithAudit(records, { createdAtField = 'created_at', updatedAtField = 'updated_at' } = {}) {
    const list = Array.isArray(records) ? records : [records];
    if (list.length === 0) return Array.isArray(records) ? [] : null;

    const relatedIds = new Set();
    for (const row of list) {
        if (row?.created_by) relatedIds.add(row.created_by);
        if (row?.updated_by) relatedIds.add(row.updated_by);
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

    const enriched = list.map((row) => ({
        ...row,
        created_by_name:
            row.created_by_name ||
            (row.created_by ? nameById[row.created_by] : null) ||
            'Not recorded',
        updated_by_name:
            row.updated_by_name ||
            (row.updated_by ? nameById[row.updated_by] : null) ||
            null,
        _auditCreatedAt: row[createdAtField],
        _auditUpdatedAt: row[updatedAtField],
    }));

    return Array.isArray(records) ? enriched : enriched[0];
}

export async function backfillMissingCreatedBy(modelDelegate, selfLabel = 'Not recorded') {
    await modelDelegate.updateMany({
        where: { created_by: null, created_by_name: null },
        data: { created_by_name: selfLabel },
    });
}

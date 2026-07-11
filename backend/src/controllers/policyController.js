import prisma from '../lib/prisma.js';
import { isSystemPolicySlug, withPolicyMeta, SYSTEM_POLICY_SLUGS } from '../constants/systemPolicies.js';

const slugify = (value) =>
    String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const pickPolicyFields = (body, { isSystem = false } = {}) => {
    const { slug, title, description, content, status, sort_order } = body;
    const data = {};

    if (title !== undefined) data.title = String(title).trim();
    if (!isSystem && slug !== undefined) data.slug = slugify(slug);
    if (description !== undefined) data.description = description || null;
    if (content !== undefined) data.content = content || null;
    if (status !== undefined) data.status = status === 'inactive' ? 'inactive' : 'active';
    if (sort_order !== undefined) {
        const order = parseInt(sort_order, 10);
        data.sort_order = Number.isNaN(order) ? 0 : order;
    }

    return data;
};

export const getPolicies = async (req, res) => {
    try {
        const showAll = req.query.all === 'true';
        const systemOnly = req.query.system_only === 'true';
        const where = {};
        if (!showAll) where.status = 'active';
        if (systemOnly) where.slug = { in: SYSTEM_POLICY_SLUGS };
        const policies = await prisma.policies.findMany({
            where,
            orderBy: [{ sort_order: 'asc' }, { title: 'asc' }],
        });
        res.json(policies.map(withPolicyMeta));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPolicyBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const policy = await prisma.policies.findUnique({ where: { slug } });
        if (!policy) return res.status(404).json({ error: 'Policy not found' });
        res.json(withPolicyMeta(policy));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPolicyById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }
        const policy = await prisma.policies.findUnique({ where: { id } });
        if (!policy) return res.status(404).json({ error: 'Policy not found' });
        res.json(withPolicyMeta(policy));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createPolicy = async (req, res) => {
    try {
        const { title, slug } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const finalSlug = slugify(slug || title);
        if (!finalSlug) {
            return res.status(400).json({ error: 'A valid slug is required' });
        }

        if (isSystemPolicySlug(finalSlug)) {
            return res.status(400).json({ error: 'This slug is reserved for a BEA system policy' });
        }

        if (!req.body.content?.trim()) {
            return res.status(400).json({ error: 'Policy content is required' });
        }

        const existing = await prisma.policies.findUnique({ where: { slug: finalSlug } });
        if (existing) {
            return res.status(400).json({ error: 'A policy with this slug already exists' });
        }

        const policy = await prisma.policies.create({
            data: {
                ...pickPolicyFields({ ...req.body, slug: finalSlug }),
                created_by: req.user?.userId ? parseInt(req.user.userId, 10) || null : null,
            },
        });
        res.status(201).json(withPolicyMeta(policy));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePolicy = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const current = await prisma.policies.findUnique({ where: { id } });
        if (!current) return res.status(404).json({ error: 'Policy not found' });

        const isSystem = isSystemPolicySlug(current.slug);
        const fields = isSystem
            ? pickPolicyFields(
                  {
                      title: req.body.title,
                      description: req.body.description,
                      content: req.body.content,
                      status: req.body.status,
                      sort_order: req.body.sort_order,
                  },
                  { isSystem: true }
              )
            : pickPolicyFields(req.body, { isSystem: false });

        if (!isSystem && fields.slug && fields.slug !== current.slug) {
            if (isSystemPolicySlug(fields.slug)) {
                return res.status(400).json({ error: 'This slug is reserved for a BEA system policy' });
            }
            const taken = await prisma.policies.findUnique({ where: { slug: fields.slug } });
            if (taken) {
                return res.status(400).json({ error: 'A policy with this slug already exists' });
            }
        }

        if (!isSystem && req.body.content !== undefined && !req.body.content?.trim()) {
            return res.status(400).json({ error: 'Policy content is required' });
        }

        const updated = await prisma.policies.update({
            where: { id },
            data: fields,
        });
        res.json(withPolicyMeta(updated));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePolicy = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        const current = await prisma.policies.findUnique({ where: { id } });
        if (!current) return res.status(404).json({ error: 'Policy not found' });
        if (isSystemPolicySlug(current.slug)) {
            return res.status(400).json({ error: 'System policies cannot be deleted' });
        }

        await prisma.policies.delete({ where: { id } });
        res.json({ message: 'Policy deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

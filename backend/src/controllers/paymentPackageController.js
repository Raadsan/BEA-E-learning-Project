import prisma from '../lib/prisma.js';
import { mapPackagePrograms } from '../utils/studentPaymentUtils.js';

function parsePackagePayload(body = {}) {
    const { package_name, description, amount, currency, duration_months, status } = body;
    if (!package_name || !String(package_name).trim()) {
        const error = new Error('Package name is required');
        error.statusCode = 400;
        throw error;
    }
    const months = parseInt(duration_months, 10);
    if (!months || months < 1) {
        const error = new Error('Duration must be at least 1 month');
        error.statusCode = 400;
        throw error;
    }
    return {
        package_name: String(package_name).trim(),
        description: description ? String(description) : null,
        amount: amount != null && amount !== '' ? parseFloat(amount) : null,
        currency: currency || 'USD',
        duration_months: months,
        status: status === 'inactive' ? 'inactive' : 'active',
    };
}

function parseAssignmentDiscount(body = {}) {
    const { discount_type, discount_value } = body;
    if (!discount_type || discount_type === 'none') {
        return { discount_type: null, discount_value: null };
    }
    if (!['percentage', 'fixed'].includes(discount_type)) {
        const error = new Error('Discount type must be percentage or fixed');
        error.statusCode = 400;
        throw error;
    }
    const value = parseFloat(discount_value);
    if (Number.isNaN(value) || value < 0) {
        const error = new Error('Discount value must be a positive number');
        error.statusCode = 400;
        throw error;
    }
    if (discount_type === 'percentage' && value > 100) {
        const error = new Error('Percentage discount cannot exceed 100');
        error.statusCode = 400;
        throw error;
    }
    return { discount_type, discount_value: value };
}

export const createPackage = async (req, res) => {
    try {
        const data = parsePackagePayload(req.body);
        const pkg = await prisma.payment_packages.create({ data });
        res.status(201).json(pkg);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const getAllPackages = async (req, res) => {
    try {
        const packages = await prisma.payment_packages.findMany({
            include: { program_payment_packages: { include: { programs: true } } },
            orderBy: { duration_months: "asc" },
        });
        res.json(packages.map(mapPackagePrograms));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getPackageById = async (req, res) => {
    try {
        const pkg = await prisma.payment_packages.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { program_payment_packages: { include: { programs: true } } }
        });
        if (!pkg) return res.status(404).json({ error: 'Not found' });
        res.json(mapPackagePrograms(pkg));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updatePackage = async (req, res) => {
    try {
        const data = parsePackagePayload(req.body);
        const updated = await prisma.payment_packages.update({
            where: { id: parseInt(req.params.id) },
            data,
        });
        res.json(updated);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        await prisma.payment_packages.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const assignToProgram = async (req, res) => {
    try {
        const { programId } = req.body;
        const packageId = parseInt(req.params.id, 10);
        const program_id = parseInt(programId, 10);
        if (!program_id) {
            return res.status(400).json({ error: 'Program is required' });
        }
        const discount = parseAssignmentDiscount(req.body);
        const existing = await prisma.program_payment_packages.findFirst({
            where: { payment_package_id: packageId, program_id },
        });
        if (existing) {
            await prisma.program_payment_packages.update({
                where: { id: existing.id },
                data: discount,
            });
        } else {
            await prisma.program_payment_packages.create({
                data: {
                    payment_package_id: packageId,
                    program_id,
                    ...discount,
                },
            });
        }
        const pkg = await prisma.payment_packages.findUnique({
            where: { id: packageId },
            include: { program_payment_packages: { include: { programs: true } } },
        });
        res.json(mapPackagePrograms(pkg));
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const updateProgramAssignment = async (req, res) => {
    try {
        const packageId = parseInt(req.params.id, 10);
        const program_id = parseInt(req.params.programId, 10);
        const discount = parseAssignmentDiscount(req.body);
        const link = await prisma.program_payment_packages.findFirst({
            where: { payment_package_id: packageId, program_id },
        });
        if (!link) return res.status(404).json({ error: 'Assignment not found' });
        await prisma.program_payment_packages.update({
            where: { id: link.id },
            data: discount,
        });
        const pkg = await prisma.payment_packages.findUnique({
            where: { id: packageId },
            include: { program_payment_packages: { include: { programs: true } } },
        });
        res.json(mapPackagePrograms(pkg));
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const removeFromProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        const packageId = parseInt(req.params.id);
        await prisma.program_payment_packages.deleteMany({
            where: { payment_package_id: packageId, program_id: parseInt(programId) }
        });
        res.json({ message: 'Removed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

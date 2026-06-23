import prisma from '../lib/prisma.js';
import { mapPackagePrograms } from '../utils/studentPaymentUtils.js';

export const createPackage = async (req, res) => {
    try {
        const pkg = await prisma.payment_packages.create({ data: req.body });
        res.status(201).json(pkg);
    } catch (err) { res.status(500).json({ error: err.message }); }
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
        const updated = await prisma.payment_packages.update({ where: { id: parseInt(req.params.id) }, data: req.body });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
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
        const packageId = parseInt(req.params.id);
        await prisma.program_payment_packages.create({
            data: { payment_package_id: packageId, program_id: parseInt(programId, 10) }
        });
        res.json({ message: 'Assigned' });
    } catch (err) { res.status(500).json({ error: err.message }); }
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

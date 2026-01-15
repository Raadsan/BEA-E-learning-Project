import * as paymentPackageModel from "../models/paymentPackageModel.js";

// Create package
export const createPackage = async (req, res) => {
    try {
        const newPackage = await paymentPackageModel.createPaymentPackage(req.body);
        res.status(201).json(newPackage);
    } catch (error) {
        res.status(500).json({ message: "Error creating payment package", error: error.message });
    }
};

// Get all packages
export const getAllPackages = async (req, res) => {
    try {
        const packages = await paymentPackageModel.getAllPaymentPackages();
        // For each package, get assigned programs
        const packagesWithPrograms = await Promise.all(packages.map(async (pkg) => {
            const programs = await paymentPackageModel.getProgramsByPackageId(pkg.id);
            return { ...pkg, programs };
        }));
        res.status(200).json(packagesWithPrograms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment packages", error: error.message });
    }
};

// Get single package
export const getPackageById = async (req, res) => {
    try {
        const pkg = await paymentPackageModel.getPaymentPackageById(req.params.id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });
        const programs = await paymentPackageModel.getProgramsByPackageId(pkg.id);
        res.status(200).json({ ...pkg, programs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment package", error: error.message });
    }
};

// Update package
export const updatePackage = async (req, res) => {
    try {
        const affectedRows = await paymentPackageModel.updatePaymentPackageById(req.params.id, req.body);
        if (affectedRows === 0) return res.status(404).json({ message: "Package not found or no changes made" });
        const updatedPackage = await paymentPackageModel.getPaymentPackageById(req.params.id);
        res.status(200).json(updatedPackage);
    } catch (error) {
        res.status(500).json({ message: "Error updating payment package", error: error.message });
    }
};

// Delete package
export const deletePackage = async (req, res) => {
    try {
        const affectedRows = await paymentPackageModel.deletePaymentPackageById(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: "Package not found" });
        res.status(200).json({ message: "Payment package deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting payment package", error: error.message });
    }
};

// Assign package to program
export const assignToProgram = async (req, res) => {
    try {
        const { programId } = req.body;
        const packageId = req.params.id;
        await paymentPackageModel.assignPackageToProgram(packageId, programId);
        res.status(200).json({ message: "Package assigned to program successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error assigning package to program", error: error.message });
    }
};

// Remove package from program
export const removeFromProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        const packageId = req.params.id;
        await paymentPackageModel.removePackageFromProgram(packageId, programId);
        res.status(200).json({ message: "Package removed from program successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error removing package from program", error: error.message });
    }
};

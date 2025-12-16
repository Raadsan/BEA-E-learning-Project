import * as Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";

// Get all admins
export const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.getAllAdmins();
        res.status(200).json(admins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ error: "Failed to fetch admins" });
    }
};

// Get single admin
export const getAdmin = async (req, res) => {
    try {
        const admin = await Admin.getAdminById(req.params.id);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (error) {
        console.error("Error fetching admin:", error);
        res.status(500).json({ error: "Failed to fetch admin" });
    }
};

// Create admin
export const createAdmin = async (req, res) => {
    try {
        const { full_name, first_name, last_name, username, email, password, phone, role } = req.body;

        // Split full_name if provided, otherwise use first/last name
        let fName = first_name;
        let lName = last_name;

        if (full_name && (!fName || !lName)) {
            const names = full_name.split(' ');
            fName = names[0];
            lName = names.slice(1).join(' ');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.createAdmin({
            first_name: fName,
            last_name: lName,
            username,
            email,
            password: hashedPassword,
            phone,
            role
        });

        res.status(201).json(newAdmin);
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ error: "Failed to create admin" });
    }
};

// Update admin
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Admin Debug] Updating admin ${id} with data:`, req.body);
        const updateData = { ...req.body };

        // Handle name splitting for update
        if (updateData.full_name) {
            const names = updateData.full_name.split(' ');
            updateData.first_name = names[0];
            updateData.last_name = names.slice(1).join(' ');
            delete updateData.full_name; // Model doesn't have full_name
        }

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Remove password from updateData if it's empty/null to avoid overwriting with empty string
        if (!updateData.password) {
            delete updateData.password;
        }

        const result = await Admin.updateAdminById(id, updateData);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Admin not found or no changes made" });
        }

        const updatedAdmin = await Admin.getAdminById(id);
        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({ error: "Failed to update admin" });
    }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
    try {
        const result = await Admin.deleteAdminById(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ error: "Failed to delete admin" });
    }
};

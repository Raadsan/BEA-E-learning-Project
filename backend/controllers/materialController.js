// controllers/materialController.js
import * as Material from "../models/materialModel.js";
import * as Student from "../models/studentModel.js";
import * as Class from "../models/classModel.js";
import * as Subprogram from "../models/subprogramModel.js";

// CREATE Material
export const createMaterial = async (req, res) => {
    try {
        const { title, type, program_id, subprogram_id, level, subject, description, url, status } = req.body;

        if (!title || !type || !url) {
            return res.status(400).json({ error: "Title, type, and URL are required" });
        }

        const material = await Material.createMaterial({
            title, type, program_id, subprogram_id, level, subject, description, url, status
        });

        res.status(201).json({ message: "Material created", material });
    } catch (err) {
        console.error("❌ Create material error:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

// GET ALL Materials (Admin)
export const getMaterials = async (req, res) => {
    try {
        const materials = await Material.getAllMaterials();
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// GET Student Materials
export const getStudentMaterials = async (req, res) => {
    try {
        // Get student info from token (req.user)
        const studentId = req.user.id;
        const student = await Student.getStudentById(studentId);

        if (!student) return res.status(404).json({ error: "Student not found" });

        // Identify student's program and subprogram
        const programId = student.chosen_program;
        const subprogramId = student.chosen_subprogram;

        const materials = await Material.getMaterialsByLevel(programId, subprogramId);
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await Material.updateMaterialById(id, req.body);

        if (affected === 0) return res.status(404).json({ error: "Material not found or no changes" });

        const updated = await Material.getMaterialById(id);
        res.json({ message: "Updated", material: updated });
    } catch (err) {
        console.error("❌ Update material error:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

// DELETE Material
export const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await Material.deleteMaterialById(id);

        if (affected === 0) return res.status(404).json({ error: "Material not found" });

        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

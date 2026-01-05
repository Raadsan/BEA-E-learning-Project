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
        // Fix: Use req.user.userId instead of req.user.id
        const studentId = req.user.userId;
        const student = await Student.getStudentById(studentId);

        if (!student) {
            console.error(`❌ Student not found for ID: ${studentId}`);
            return res.status(404).json({ error: "Student not found" });
        }

        // Identify student's program and subprogram
        const programId = student.chosen_program;
        const subprogramId = student.chosen_subprogram;

        console.log("📚 Fetching materials for student:", {
            studentId,
            studentName: student.full_name,
            programId,
            subprogramId
        });

        const materials = await Material.getMaterialsByLevel(programId, subprogramId);

        console.log(`✅ Found ${materials.length} materials for student ${student.full_name}`);
        if (materials.length > 0) {
            console.log("Materials:", materials.map(m => ({ id: m.id, title: m.title, subprogram_id: m.subprogram_id, program_id: m.program_id })));
        }

        res.json(materials);
    } catch (err) {
        console.error("❌ Error fetching student materials:", err);
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

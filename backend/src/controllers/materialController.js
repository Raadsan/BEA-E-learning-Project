import prisma from '../lib/prisma.js';

export const createMaterial = async (req, res) => {
    try {
        const { title, type, program_id, subprogram_id, level, subject, description, url, status } = req.body;
        if (!title || !type || !url) return res.status(400).json({ error: 'Title, type, and URL required' });
        const material = await prisma.learning_materials.create({
            data: { title, type, program_id: program_id ? parseInt(program_id) : null, subprogram_id: subprogram_id ? parseInt(subprogram_id) : null, level, subject, description, url, status: status || 'Active' }
        });
        res.status(201).json(material);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMaterials = async (req, res) => {
    try {
        const materials = await prisma.learning_materials.findMany({ orderBy: { created_at: 'desc' } });
        
        // Fetch relations manually to prevent schema relation mismatch
        const programs = await prisma.programs.findMany();
        const subprograms = await prisma.subprograms.findMany();

        const mappedMaterials = materials.map(mat => {
            const program = programs.find(p => p.id === mat.program_id);
            const subprogram = subprograms.find(sp => sp.id === mat.subprogram_id);

            return {
                ...mat,
                program_name: program ? program.title || program.program_name || program.name : null,
                subprogram_name: subprogram ? subprogram.subprogram_name || subprogram.title || subprogram.name : null
            };
        });

        res.json(mappedMaterials);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getStudentMaterials = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const student = await prisma.students.findUnique({ where: { student_id: studentId } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Find their subprogram by class
        let subprogramId = null;
        if (student.class_id) {
            const cls = await prisma.classes.findUnique({ where: { id: student.class_id } });
            subprogramId = cls?.subprogram_id;
        }

        const where = {};
        if (subprogramId) {
            where.OR = [{ subprogram_id: subprogramId }, { subprogram_id: null }];
        }

        const materials = await prisma.learning_materials.findMany({ where, orderBy: { created_at: 'desc' } });
        
        const programs = await prisma.programs.findMany();
        const subprograms = await prisma.subprograms.findMany();

        const mappedMaterials = materials.map(mat => {
            const program = programs.find(p => p.id === mat.program_id);
            const subprogram = subprograms.find(sp => sp.id === mat.subprogram_id);

            return {
                ...mat,
                program_name: program ? program.title || program.program_name || program.name : null,
                subprogram_name: subprogram ? subprogram.subprogram_name || subprogram.title || subprogram.name : null
            };
        });

        res.json(mappedMaterials);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateMaterial = async (req, res) => {
    try {
        const updated = await prisma.learning_materials.update({ where: { id: parseInt(req.params.id) }, data: req.body });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteMaterial = async (req, res) => {
    try {
        await prisma.learning_materials.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

import prisma from '../lib/prisma.js';
import {
  buildCreateAudit,
  buildUpdateAudit,
  enrichWithAudit,
  backfillMissingCreatedBy,
} from '../utils/auditTrail.js';

export const createMaterial = async (req, res) => {
    try {
        const { title, type, program_id, subprogram_id, level, subject, description, url, status } = req.body;
        if (!title || !type || !url) return res.status(400).json({ error: 'Title, type, and URL required' });
        
        const dbStatus = (status === 'Published' || status === 'Active') ? 'Active' : 'Inactive';
        const createAudit = await buildCreateAudit(req, 'System');
        
        const material = await prisma.learning_materials.create({
            data: { title, type, program_id: program_id ? parseInt(program_id) : null, subprogram_id: subprogram_id ? parseInt(subprogram_id) : null, level, subject, description, url, status: dbStatus, ...createAudit }
        });
        res.status(201).json(material);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMaterials = async (req, res) => {
    try {
        await backfillMissingCreatedBy(prisma.learning_materials);
        const materials = await prisma.learning_materials.findMany({ orderBy: { created_at: 'desc' } });
        
        const programs = await prisma.programs.findMany();
        const subprograms = await prisma.subprograms.findMany();

        const mappedMaterials = (await enrichWithAudit(materials)).map(mat => {
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
        const data = { ...req.body };
        if (data.status) {
            data.status = (data.status === 'Published' || data.status === 'Active') ? 'Active' : 'Inactive';
        }
        if (data.program_id !== undefined) {
            data.program_id = data.program_id ? parseInt(data.program_id) : null;
        }
        if (data.subprogram_id !== undefined) {
            data.subprogram_id = data.subprogram_id ? parseInt(data.subprogram_id) : null;
        }
        delete data.created_by;
        delete data.created_by_name;
        delete data.updated_by;
        delete data.updated_by_name;
        Object.assign(data, await buildUpdateAudit(req));
        
        const updated = await prisma.learning_materials.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteMaterial = async (req, res) => {
    try {
        await prisma.learning_materials.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

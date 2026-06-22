import prisma from '../lib/prisma.js';
import {
  buildCreateAudit,
  buildUpdateAudit,
  enrichWithAudit,
  backfillMissingCreatedBy,
} from '../utils/auditTrail.js';

// CREATE SUBPROGRAM
export const createSubprogram = async (req, res) => {
  try {
    const { subprogram_name, program_id, description, status } = req.body;
    if (!subprogram_name || !program_id) return res.status(400).json({ error: "Required fields missing" });

    const program = await prisma.programs.findUnique({ where: { id: parseInt(program_id) } });
    if (!program) return res.status(400).json({ error: "Program not found" });

    const existing = await prisma.subprograms.findFirst({
      where: { subprogram_name, program_id: parseInt(program_id) }
    });
    if (existing) return res.status(400).json({ error: "Duplicate subprogram name" });

    const createAudit = await buildCreateAudit(req, 'System');

    const subprogram = await prisma.subprograms.create({
      data: {
        subprogram_name,
        program_id: parseInt(program_id),
        description,
        status,
        ...createAudit,
      }
    });
    res.status(201).json({ message: "Created", subprogram });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL SUBPROGRAMS
export const getSubprograms = async (req, res) => {
  try {
    await backfillMissingCreatedBy(prisma.subprograms);
    const subprograms = await prisma.subprograms.findMany({
      include: { programs: true },
      orderBy: { subprogram_name: 'asc' }
    });

    const mappedSubprograms = (await enrichWithAudit(subprograms)).map((sub) => ({
      ...sub,
      program_name: sub.programs?.title || sub.programs?.program_name || sub.programs?.name || 'N/A',
    }));

    res.json(mappedSubprograms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BY PROGRAM ID
export const getSubprogramsByProgramId = async (req, res) => {
  try {
    const subprograms = await prisma.subprograms.findMany({
      where: { program_id: parseInt(req.params.program_id) }
    });
    res.json(subprograms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE SUBPROGRAM
export const getSubprogram = async (req, res) => {
  try {
    const subprogram = await prisma.subprograms.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { programs: true }
    });
    if (!subprogram) return res.status(404).json({ error: "Not found" });
    res.json(await enrichWithAudit(subprogram));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE SUBPROGRAM
export const updateSubprogram = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.program_id) data.program_id = parseInt(data.program_id);
    delete data.created_by;
    delete data.created_by_name;
    delete data.updated_by;
    delete data.updated_by_name;
    Object.assign(data, await buildUpdateAudit(req));

    const updated = await prisma.subprograms.update({
      where: { id: parseInt(id) },
      data
    });
    res.json({ message: "Updated", subprogram: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE SUBPROGRAM
export const deleteSubprogram = async (req, res) => {
  try {
    await prisma.subprograms.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

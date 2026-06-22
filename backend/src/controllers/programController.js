import prisma from '../lib/prisma.js';
import fs from "fs";
import path from "path";
import {
  buildCreateAudit,
  buildUpdateAudit,
  enrichWithAudit,
  backfillMissingCreatedBy,
} from '../utils/auditTrail.js';

const parseShowOnWebsite = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

// CREATE PROGRAM
export const createProgram = async (req, res) => {
  try {
    const files = req.files || [];
    const imageFile = files.find(f => f.fieldname === 'image');
    const videoFile = files.find(f => f.fieldname === 'video');
    const curriculumFile = files.find(f => f.fieldname === 'curriculum');
    
    const image = imageFile ? `/uploads/${imageFile.filename}` : null;
    const video = videoFile ? `/uploads/${videoFile.filename}` : null;
    const curriculum_file = curriculumFile ? `/uploads/${curriculumFile.filename}` : null;

    const { title, description, status, price, discount, test_required, show_on_website } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const createAudit = await buildCreateAudit(req, 'System');

    const program = await prisma.programs.create({
      data: {
        title, description, status, 
        price: price ? parseFloat(price) : 0,
        discount: discount ? parseFloat(discount) : 0,
        test_required, image, video, curriculum_file,
        show_on_website: parseShowOnWebsite(show_on_website, true),
        ...createAudit,
      }
    });

    res.status(201).json({ message: "Program created", program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL PROGRAMS
export const getPrograms = async (req, res) => {
  try {
    await backfillMissingCreatedBy(prisma.programs);
    const programs = await prisma.programs.findMany({
      include: { subprograms: true },
      orderBy: { title: 'asc' }
    });
    res.json(await enrichWithAudit(programs));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE PROGRAM
export const getProgram = async (req, res) => {
  try {
    const program = await prisma.programs.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { subprograms: true }
    });
    if (!program) return res.status(404).json({ error: "Not found" });
    res.json(await enrichWithAudit(program));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROGRAM
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.programs.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const files = req.files || [];
    const imageFile = files.find(f => f.fieldname === 'image');
    const videoFile = files.find(f => f.fieldname === 'video');
    const curriculumFile = files.find(f => f.fieldname === 'curriculum');

    const data = { ...req.body };
    if (imageFile) data.image = `/uploads/${imageFile.filename}`;
    if (videoFile) data.video = `/uploads/${videoFile.filename}`;
    if (curriculumFile) data.curriculum_file = `/uploads/${curriculumFile.filename}`;

    if (data.price) data.price = parseFloat(data.price);
    if (data.discount) data.discount = parseFloat(data.discount);
    if (data.show_on_website !== undefined) {
      data.show_on_website = parseShowOnWebsite(data.show_on_website, existing.show_on_website ?? true);
    }
    delete data.created_by;
    delete data.created_by_name;
    delete data.updated_by;
    delete data.updated_by_name;
    Object.assign(data, await buildUpdateAudit(req));

    const updated = await prisma.programs.update({
      where: { id: parseInt(id) },
      data
    });

    // If title changed, sync students (simplified sync)
    if (data.title && data.title !== existing.title) {
       await prisma.students.updateMany({
         where: { chosen_program: existing.title },
         data: { chosen_program: data.title }
       });
    }

    res.json({ message: "Updated", program: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE PROGRAM
export const deleteProgram = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.programs.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    await prisma.programs.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

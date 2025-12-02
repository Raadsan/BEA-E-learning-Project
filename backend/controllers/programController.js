// controllers/programController.js
import * as Program from "../models/programModel.js";
import fs from "fs";
import path from "path";

// CREATE PROGRAM (image + video)
export const createProgram = async (req, res) => {
  try {
    const image = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;
    const video = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

    const { title, description } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const program = await Program.createProgram({
      image,
      video,
      title,
      description
    });

    res.status(201).json({ message: "Program created", program });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET ALL PROGRAMS
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.getAllPrograms();
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET SINGLE PROGRAM
export const getProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.getProgramById(id);

    if (!program) return res.status(404).json({ error: "Not found" });

    res.json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE PROGRAM (image + video)
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Program.getProgramById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    // DELETE OLD IMAGE IF NEW ONE COMES
    if (req.files?.image && existing.image) {
      const rel = existing.image.replace(/^[/\\]+/, "");
      const oldImagePath = path.join(process.cwd(), rel);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    // DELETE OLD VIDEO IF NEW ONE COMES
    if (req.files?.video && existing.video) {
      const rel = existing.video.replace(/^[/\\]+/, "");
      const oldVideoPath = path.join(process.cwd(), rel);
      if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
    }

    const image = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;
    const video = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

    const { title, description } = req.body;

    await Program.updateProgramById(id, {
      image,
      video,
      title,
      description
    });

    const updated = await Program.getProgramById(id);
    res.json({ message: "Updated", program: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE PROGRAM (image + video)
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Program.getProgramById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    // DELETE IMAGE
    if (existing.image) {
      const rel = existing.image.replace(/^[/\\]+/, "");
      const imgPath = path.join(process.cwd(), rel);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // DELETE VIDEO
    if (existing.video) {
      const rel = existing.video.replace(/^[/\\]+/, "");
      const videoPath = path.join(process.cwd(), rel);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }

    await Program.deleteProgramById(id);
    res.json({ message: "Deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

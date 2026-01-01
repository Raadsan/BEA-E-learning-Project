// controllers/programController.js
import * as Program from "../models/programModel.js";
import * as Student from "../models/studentModel.js";
import fs from "fs";
import path from "path";

// CREATE PROGRAM
export const createProgram = async (req, res) => {
  try {
    // Process uploaded files
    const files = req.files || [];

    // Main program image and video
    const imageFile = files.find(f => f.fieldname === 'image');
    const videoFile = files.find(f => f.fieldname === 'video');
    const image = imageFile ? `/uploads/${imageFile.filename}` : null;
    const video = videoFile ? `/uploads/${videoFile.filename}` : null;

    // Handle both JSON and multipart/form-data
    let title, description, status, price, discount;

    if (req.headers['content-type']?.includes('application/json')) {
      // JSON request
      ({ title, description, status, price, discount } = req.body);
    } else {
      // multipart/form-data request
      title = req.body.title;
      description = req.body.description;
      status = req.body.status;
      price = req.body.price;
      discount = req.body.discount;
    }

    if (!title) return res.status(400).json({ error: "Title is required" });

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }

    const program = await Program.createProgram({
      image,
      video,
      title,
      description,
      status,
      price,
      discount
    });

    res.status(201).json({ message: "Program created", program });
  } catch (err) {
    console.error("❌ Create program error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
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

// UPDATE PROGRAM
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Program.getProgramById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    // Process uploaded files
    const files = req.files || [];

    // Main program image and video
    const imageFile = files.find(f => f.fieldname === 'image');
    const videoFile = files.find(f => f.fieldname === 'video');

    // DELETE OLD IMAGE IF NEW ONE COMES
    if (imageFile && existing.image) {
      const rel = existing.image.replace(/^[/\\]+/, "");
      const oldImagePath = path.join(process.cwd(), rel);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    // DELETE OLD VIDEO IF NEW ONE COMES
    if (videoFile && existing.video) {
      const rel = existing.video.replace(/^[/\\]+/, "");
      const oldVideoPath = path.join(process.cwd(), rel);
      if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
    }

    const image = imageFile ? `/uploads/${imageFile.filename}` : undefined;
    const video = videoFile ? `/uploads/${videoFile.filename}` : undefined;

    // Handle both JSON and multipart/form-data
    let title, description, status, price, discount;

    if (req.headers['content-type']?.includes('application/json')) {
      ({ title, description, status, price, discount } = req.body);
    } else {
      title = req.body.title;
      description = req.body.description;
      status = req.body.status;
      price = req.body.price;
      discount = req.body.discount;
    }

    // Validate status if provided
    if (status !== undefined && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }

    await Program.updateProgramById(id, {
      image,
      video,
      title,
      description,
      status,
      price,
      discount
    });

    // SYNC: If title changed, update all students who have this program chosen
    if (title && title !== existing.title) {
      await Student.updateStudentProgramName(existing.title, title);
    }

    const updated = await Program.getProgramById(id);
    res.json({ message: "Updated", program: updated });

  } catch (err) {
    console.error("Update program error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
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

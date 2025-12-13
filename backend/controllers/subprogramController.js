// controllers/subprogramController.js
import * as Subprogram from "../models/subprogramModel.js";
import * as Program from "../models/programModel.js";

// CREATE SUBPROGRAM
export const createSubprogram = async (req, res) => {
  try {
    const { subprogram_name, program_id, description, status } = req.body;

    if (!subprogram_name || !program_id) {
      return res.status(400).json({ error: "Subprogram name and program ID are required" });
    }

    // Validate that program_id exists
    const program = await Program.getProgramById(program_id);
    if (!program) {
      return res.status(400).json({ error: `Program with ID ${program_id} does not exist` });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }

    const subprogram = await Subprogram.createSubprogram({
      subprogram_name,
      program_id,
      description,
      status
    });

    res.status(201).json({ message: "Subprogram created", subprogram });
  } catch (err) {
    console.error("❌ Create subprogram error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET ALL SUBPROGRAMS
export const getSubprograms = async (req, res) => {
  try {
    const subprograms = await Subprogram.getAllSubprograms();
    res.json(subprograms);
  } catch (err) {
    console.error("❌ Get subprograms error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET SUBPROGRAMS BY PROGRAM ID
export const getSubprogramsByProgramId = async (req, res) => {
  try {
    const { program_id } = req.params;
    const subprograms = await Subprogram.getSubprogramsByProgramId(program_id);
    res.json(subprograms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET SINGLE SUBPROGRAM
export const getSubprogram = async (req, res) => {
  try {
    const { id } = req.params;
    const subprogram = await Subprogram.getSubprogramById(id);

    if (!subprogram) return res.status(404).json({ error: "Not found" });

    res.json(subprogram);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE SUBPROGRAM
export const updateSubprogram = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Subprogram.getSubprogramById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    // Validate program_id if provided
    if (req.body.program_id) {
      const program = await Program.getProgramById(req.body.program_id);
      if (!program) {
        return res.status(400).json({ error: `Program with ID ${req.body.program_id} does not exist` });
      }
    }

    // Validate status if provided
    if (req.body.status && !['active', 'inactive'].includes(req.body.status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }

    await Subprogram.updateSubprogramById(id, req.body);

    const updated = await Subprogram.getSubprogramById(id);
    res.json({ message: "Updated", subprogram: updated });
  } catch (err) {
    console.error("Update subprogram error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DELETE SUBPROGRAM
export const deleteSubprogram = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Subprogram.getSubprogramById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Subprogram.deleteSubprogramById(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


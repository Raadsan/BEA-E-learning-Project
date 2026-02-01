// controllers/classController.js
import * as Class from "../models/classModel.js";
import * as Subprogram from "../models/subprogramModel.js";

// CREATE CLASS
export const createClass = async (req, res) => {
  try {
    console.log("Create Class Body:", req.body);
    const { class_name, description, subprogram_id, teacher_id, shift_id } = req.body;

    if (!class_name) {
      return res.status(400).json({ error: "Class name is required" });
    }

    // Check for uniqueness
    const existing = await Class.getClassByName(class_name);
    if (existing) {
      return res.status(400).json({ error: `Class name "${class_name}" already exists. Please choose a unique name.` });
    }

    const classItem = await Class.createClass({
      class_name,
      description,
      subprogram_id,
      teacher_id,
      shift_id
    });

    res.status(201).json({ message: "Class created", class: classItem });
  } catch (err) {
    console.error("❌ Create class error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// GET ALL CLASSES (Filtered for Teachers)
export const getClasses = async (req, res) => {
  try {
    const { role, userId } = req.user; // Populated by verifyToken middleware

    let classes;
    if (role === 'teacher') {
      classes = await Class.getClassesByTeacherId(userId);
    } else {
      // Admin (or others) see all classes
      classes = await Class.getAllClasses();
    }

    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET CLASSES BY SUBPROGRAM ID
export const getClassesBySubprogramId = async (req, res) => {
  try {
    const { subprogram_id } = req.params;
    const classes = await Class.getClassesBySubprogramId(subprogram_id);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Note: getClassesByTeacherId removed - teacher_id no longer exists in classes table

// GET SINGLE CLASS
export const getClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = await Class.getClassById(id);

    if (!classItem) return res.status(404).json({ error: "Not found" });

    res.json(classItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE CLASS
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Class.getClassById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    // If name is changing, check for uniqueness
    if (req.body.class_name && req.body.class_name !== existing.class_name) {
      const duplicate = await Class.getClassByName(req.body.class_name);
      if (duplicate) {
        return res.status(400).json({ error: `Class name "${req.body.class_name}" is already taken.` });
      }
    }

    await Class.updateClassById(id, req.body);

    const updated = await Class.getClassById(id);
    res.json({ message: "Updated", class: updated });
  } catch (err) {
    console.error("Update class error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DELETE CLASS
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Class.getClassById(id);

    if (!existing) return res.status(404).json({ error: "Not found" });

    await Class.deleteClassById(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE TWO CLASSES FOR SUBPROGRAM (MORNING AND NIGHT)
export const createClassesForSubprogram = async (req, res) => {
  try {
    const { subprogram_id, teacher_id, description } = req.body;

    if (!subprogram_id) {
      return res.status(400).json({ error: "subprogram_id is required" });
    }

    // Get subprogram information
    const subprogram = await Subprogram.getSubprogramById(subprogram_id);
    if (!subprogram) {
      return res.status(404).json({ error: "Subprogram not found" });
    }

    // Check if classes already exist for this subprogram
    const existingClasses = await Class.getAllClasses();
    const morningClassExists = existingClasses.some(
      (cls) => cls.subprogram_id == subprogram_id && (cls.type === "morning" || cls.type === "Morning")
    );
    const nightClassExists = existingClasses.some(
      (cls) => cls.subprogram_id == subprogram_id && (cls.type === "night" || cls.type === "Night")
    );

    const createdClasses = [];
    const errors = [];

    // Create Morning Class
    if (!morningClassExists) {
      try {
        const morningClassName = `${subprogram.subprogram_name} - Morning`;
        const morningClass = await Class.createClass({
          class_name: morningClassName,
          description: description || `Morning class for ${subprogram.subprogram_name}`,
          subprogram_id: subprogram_id,
          teacher_id: teacher_id || null,
          type: "morning",
        });
        createdClasses.push(morningClass);
      } catch (err) {
        errors.push({ type: "morning", error: err.message });
      }
    } else {
      errors.push({ type: "morning", error: "Morning class already exists for this subprogram" });
    }

    // Create Night Class
    if (!nightClassExists) {
      try {
        const nightClassName = `${subprogram.subprogram_name} - Night`;
        const nightClass = await Class.createClass({
          class_name: nightClassName,
          description: description || `Night class for ${subprogram.subprogram_name}`,
          subprogram_id: subprogram_id,
          teacher_id: teacher_id || null,
          type: "night",
        });
        createdClasses.push(nightClass);
      } catch (err) {
        errors.push({ type: "night", error: err.message });
      }
    } else {
      errors.push({ type: "night", error: "Night class already exists for this subprogram" });
    }

    if (createdClasses.length === 0) {
      return res.status(400).json({
        message: "No classes were created",
        errors: errors,
      });
    }

    res.status(201).json({
      message: `Successfully created ${createdClasses.length} class(es) for subprogram`,
      subprogram: {
        id: subprogram.id,
        name: subprogram.subprogram_name,
      },
      classes: createdClasses,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("❌ Create classes for subprogram error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// CREATE TWO CLASSES FOR ALL SUBPROGRAMS (MORNING AND NIGHT FOR EACH)
export const createClassesForAllSubprograms = async (req, res) => {
  try {
    const { teacher_id, description } = req.body;

    // Get all subprograms
    const allSubprograms = await Subprogram.getAllSubprograms();

    if (allSubprograms.length === 0) {
      return res.status(404).json({ error: "No subprograms found" });
    }

    // Get all existing classes
    const existingClasses = await Class.getAllClasses();

    const results = [];
    let totalCreated = 0;
    let totalErrors = 0;

    // Process each subprogram
    for (const subprogram of allSubprograms) {
      const subprogramResult = {
        subprogram_id: subprogram.id,
        subprogram_name: subprogram.subprogram_name,
        created: [],
        errors: [],
      };

      // Check if classes already exist for this subprogram
      const morningClassExists = existingClasses.some(
        (cls) => cls.subprogram_id == subprogram.id && (cls.type === "morning" || cls.type === "Morning")
      );
      const nightClassExists = existingClasses.some(
        (cls) => cls.subprogram_id == subprogram.id && (cls.type === "night" || cls.type === "Night")
      );

      // Create Morning Class
      if (!morningClassExists) {
        try {
          const morningClassName = `${subprogram.subprogram_name} - Morning`;
          const morningClass = await Class.createClass({
            class_name: morningClassName,
            description: description || `Morning class for ${subprogram.subprogram_name}`,
            subprogram_id: subprogram.id,
            teacher_id: teacher_id || null,
            type: "morning",
          });
          subprogramResult.created.push(morningClass);
          totalCreated++;
        } catch (err) {
          subprogramResult.errors.push({ type: "morning", error: err.message });
          totalErrors++;
        }
      } else {
        subprogramResult.errors.push({ type: "morning", error: "Morning class already exists" });
        totalErrors++;
      }

      // Create Night Class
      if (!nightClassExists) {
        try {
          const nightClassName = `${subprogram.subprogram_name} - Night`;
          const nightClass = await Class.createClass({
            class_name: nightClassName,
            description: description || `Night class for ${subprogram.subprogram_name}`,
            subprogram_id: subprogram.id,
            teacher_id: teacher_id || null,
            type: "night",
          });
          subprogramResult.created.push(nightClass);
          totalCreated++;
        } catch (err) {
          subprogramResult.errors.push({ type: "night", error: err.message });
          totalErrors++;
        }
      } else {
        subprogramResult.errors.push({ type: "night", error: "Night class already exists" });
        totalErrors++;
      }

      results.push(subprogramResult);
    }

    res.status(201).json({
      message: `Processed ${allSubprograms.length} subprogram(s). Created ${totalCreated} class(es), ${totalErrors} error(s).`,
      total_subprograms: allSubprograms.length,
      total_classes_created: totalCreated,
      total_errors: totalErrors,
      results: results,
    });
  } catch (err) {
    console.error("❌ Create classes for all subprograms error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};


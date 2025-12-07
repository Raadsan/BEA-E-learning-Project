// controllers/programController.js
import * as Program from "../models/programModel.js";
import fs from "fs";
import path from "path";

// CREATE PROGRAM (image + video + sub_programs with images)
export const createProgram = async (req, res) => {
  try {
    // Debug: Log request details
    console.log("📥 Request received:");
    console.log("  Content-Type:", req.headers['content-type']);
    console.log("  Files:", req.files ? req.files.length : 0);
    console.log("  Body keys:", Object.keys(req.body));
    
    // Process uploaded files
    const files = req.files || [];
    
    // Log files for debugging
    if (files.length > 0) {
      console.log("📁 Uploaded files:");
      files.forEach((file, idx) => {
        console.log(`  ${idx}: fieldname="${file.fieldname}", filename="${file.filename}"`);
      });
    }
    
    // Main program image and video
    const imageFile = files.find(f => f.fieldname === 'image');
    const videoFile = files.find(f => f.fieldname === 'video');
    const image = imageFile ? `/uploads/${imageFile.filename}` : null;
    const video = videoFile ? `/uploads/${videoFile.filename}` : null;

    console.log("📸 Image:", image);
    console.log("🎥 Video:", video);

    // Handle both JSON and multipart/form-data
    let title, description, sub_programs;
    
    if (req.headers['content-type']?.includes('application/json')) {
      // JSON request
      ({ title, description, sub_programs } = req.body);
    } else {
      // multipart/form-data request
      title = req.body.title;
      description = req.body.description;
      sub_programs = req.body.sub_programs;
    }

    console.log("📝 Title:", title);
    console.log("📄 Description:", description ? description.substring(0, 50) + "..." : "null");
    console.log("📋 Sub-programs (raw):", typeof sub_programs, sub_programs ? (typeof sub_programs === 'string' ? sub_programs.substring(0, 100) + "..." : "array/object") : "null");

    if (!title) return res.status(400).json({ error: "Title is required" });

    // Parse sub_programs - handle string, array, or undefined
    let parsedSubPrograms = [];
    if (sub_programs !== undefined && sub_programs !== null && sub_programs !== '') {
      try {
        if (typeof sub_programs === 'string') {
          // Try to parse as JSON string
          parsedSubPrograms = JSON.parse(sub_programs);
        } else if (Array.isArray(sub_programs)) {
          // Already an array
          parsedSubPrograms = sub_programs;
        } else if (typeof sub_programs === 'object') {
          // Single object, wrap in array
          parsedSubPrograms = [sub_programs];
        }
        console.log("✅ Parsed sub-programs:", parsedSubPrograms.length, "items");
      } catch (e) {
        console.error("❌ Error parsing sub_programs:", e);
        return res.status(400).json({ error: "Invalid sub_programs JSON format: " + e.message });
      }
    } else {
      console.log("ℹ️  No sub_programs provided");
    }

    // Map uploaded sub-program images to their respective sub-programs
    // Expected field names: sub_program_0_image, sub_program_1_image, etc.
    parsedSubPrograms = parsedSubPrograms.map((subProgram, index) => {
      const subProgramImageField = `sub_program_${index}_image`;
      const subProgramImageFile = files.find(f => f.fieldname === subProgramImageField);
      
      if (subProgramImageFile) {
        console.log(`  📷 Sub-program ${index} image: /uploads/${subProgramImageFile.filename}`);
        return {
          ...subProgram,
          image: `/uploads/${subProgramImageFile.filename}`
        };
      }
      // If no uploaded image, keep the existing image value (if provided in JSON)
      return subProgram;
    });

    console.log("💾 Saving program with sub_programs:", parsedSubPrograms.length, "items");
    console.log("💾 Sub-programs data:", JSON.stringify(parsedSubPrograms, null, 2));

    const program = await Program.createProgram({
      image,
      video,
      title,
      description,
      sub_programs: parsedSubPrograms
    });

    console.log("✅ Program created successfully, ID:", program.id);
    console.log("📤 Program object keys:", Object.keys(program));
    console.log("📤 Response sub_programs:", program.sub_programs ? program.sub_programs.length : 0, "items");
    console.log("📤 Full program object:", JSON.stringify(program, null, 2));

    // Ensure sub_programs is always included in response
    const responseProgram = {
      ...program,
      sub_programs: program.sub_programs || []
    };

    res.status(201).json({ message: "Program created", program: responseProgram });
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

// UPDATE PROGRAM (image + video + sub_programs with images)
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
    let title, description, sub_programs;
    
    if (req.headers['content-type']?.includes('application/json')) {
      ({ title, description, sub_programs } = req.body);
    } else {
      title = req.body.title;
      description = req.body.description;
      sub_programs = req.body.sub_programs;
    }

    // Parse sub_programs if provided
    let parsedSubPrograms = undefined;
    if (sub_programs !== undefined && sub_programs !== null && sub_programs !== '') {
      try {
        if (typeof sub_programs === 'string') {
          parsedSubPrograms = JSON.parse(sub_programs);
        } else if (Array.isArray(sub_programs)) {
          parsedSubPrograms = sub_programs;
        } else if (typeof sub_programs === 'object') {
          parsedSubPrograms = [sub_programs];
        }
      } catch (e) {
        return res.status(400).json({ error: "Invalid sub_programs JSON format: " + e.message });
      }

      // Map uploaded sub-program images to their respective sub-programs
      if (parsedSubPrograms && Array.isArray(parsedSubPrograms)) {
        parsedSubPrograms = parsedSubPrograms.map((subProgram, index) => {
          const subProgramImageField = `sub_program_${index}_image`;
          const subProgramImageFile = files.find(f => f.fieldname === subProgramImageField);
          
          if (subProgramImageFile) {
            // Delete old sub-program image if it exists
            if (subProgram.image && subProgram.image.startsWith('/uploads/')) {
              const oldSubImagePath = path.join(process.cwd(), subProgram.image.replace(/^[/\\]+/, ""));
              if (fs.existsSync(oldSubImagePath)) fs.unlinkSync(oldSubImagePath);
            }
            return {
              ...subProgram,
              image: `/uploads/${subProgramImageFile.filename}`
            };
          }
          // Keep existing image if no new upload
          return subProgram;
        });
      }
    }

    await Program.updateProgramById(id, {
      image,
      video,
      title,
      description,
      sub_programs: parsedSubPrograms
    });

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

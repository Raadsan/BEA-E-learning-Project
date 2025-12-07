// models/programModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();


export const createProgram = async ({ image, video, title, description, sub_programs }) => {
  const subProgramsJson = typeof sub_programs === 'string' 
    ? sub_programs 
    : JSON.stringify(sub_programs || []);

  const [result] = await dbp.query(
    "INSERT INTO programs (image, video, title, description, sub_programs) VALUES (?, ?, ?, ?, ?)",
    [image, video, title, description, subProgramsJson]
  );

  const [newProgram] = await dbp.query("SELECT * FROM programs WHERE id = ?", [result.insertId]);

  const row = newProgram[0];

  console.log("🔍 Database row keys:", Object.keys(row));
  console.log("🔍 Database sub_programs (raw):", row.sub_programs ? (typeof row.sub_programs) : "null/undefined");
  console.log("🔍 Database sub_programs (value):", row.sub_programs ? row.sub_programs.substring(0, 200) : "null");

  // Parse sub_programs JSON
  let parsedSubPrograms = [];
  if (row.sub_programs) {
    try {
      parsedSubPrograms = typeof row.sub_programs === 'string' 
        ? JSON.parse(row.sub_programs) 
        : row.sub_programs;
      console.log("✅ Parsed sub_programs from DB:", parsedSubPrograms.length, "items");
    } catch (e) {
      console.error("❌ Error parsing sub_programs from database:", e);
      console.error("❌ Raw value:", row.sub_programs);
      parsedSubPrograms = [];
    }
  } else {
    console.log("⚠️  sub_programs is null/undefined in database row");
  }

  const resultObj = {
    ...row,
    sub_programs: parsedSubPrograms
  };

  console.log("📦 Returning program object with sub_programs:", resultObj.sub_programs.length, "items");

  return resultObj;
};


// GET all programs
export const getAllPrograms = async () => {
  const [rows] = await dbp.query(
    "SELECT * FROM programs ORDER BY created_at DESC"
  );
  // Parse JSON sub_programs for each program
  return rows.map(row => ({
    ...row,
    sub_programs: row.sub_programs ? JSON.parse(row.sub_programs) : []
  }));
};

// GET program by ID
export const getProgramById = async (id) => {
  const [rows] = await dbp.query("SELECT * FROM programs WHERE id = ?", [id]);
  if (rows[0]) {
    return {
      ...rows[0],
      sub_programs: rows[0].sub_programs ? JSON.parse(rows[0].sub_programs) : []
    };
  }
  return null;
};

// UPDATE program
export const updateProgramById = async (id, { image, video, title, description, sub_programs }) => {
  // Build dynamic update query
  const updates = [];
  const values = [];

  if (image !== undefined) {
    updates.push("image = ?");
    values.push(image);
  }
  if (video !== undefined) {
    updates.push("video = ?");
    values.push(video);
  }
  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (sub_programs !== undefined) {
    updates.push("sub_programs = ?");
    const subProgramsJson = typeof sub_programs === 'string' 
      ? sub_programs 
      : JSON.stringify(sub_programs);
    values.push(subProgramsJson);
  }

  if (updates.length === 0) {
    return 0;
  }

  values.push(id);
  const [result] = await dbp.query(
    `UPDATE programs SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

// DELETE program
export const deleteProgramById = async (id) => {
  const [result] = await dbp.query("DELETE FROM programs WHERE id = ?", [id]);
  return result.affectedRows;
};

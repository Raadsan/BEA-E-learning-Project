// routes/programRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";

const router = express.Router();

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // upload folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

// Multer File Filter (accept images + videos)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files allowed"), false);
  }
};

// Multer Instance
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for video
  },
  fileFilter,
});

// ---------- ROUTES ----------
router.get("/", getPrograms);
router.get("/:id", getProgram);

// CREATE program (image + video + sub-program images)
router.post(
  "/",
  upload.any(), // Accept any number of files with any field names
  createProgram
);

// UPDATE program (image + video + sub-program images)
router.put(
  "/:id",
  upload.any(), // Accept any number of files with any field names
  updateProgram
);

// DELETE program
router.delete("/:id", deleteProgram);

export default router;

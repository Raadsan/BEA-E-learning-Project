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

// CREATE program (image + video)
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createProgram
);

// UPDATE program (image + video)
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateProgram
);

// DELETE program
router.delete("/:id", deleteProgram);

export default router;

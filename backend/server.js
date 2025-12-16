import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import path from "path";
import cors from "cors";
import db from "./database/dbconfig.js";
import programRoutes from "./routes/programRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import subprogramRoutes from "./routes/subprogramRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import placementTestRoutes from "./routes/placementTestRoutes.js";
import proficiencyTestRoutes from "./routes/proficiencyTestRoutes.js";
import ieltsToeflRoutes from "./routes/ieltsToeflRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Home route
app.get("/", (req, res) => {
  res.send("Backend is Running...");
});

// Example users route
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// ⬇️ Register Programs Routes
app.use("/api/programs", programRoutes);

// ⬇️ Register Contact Routes (Save to DB + Send Email)
app.use("/api/contact", contactRoutes);

// ⬇️ Register Student Routes (Registration + Management)
app.use("/api/students", studentRoutes);

// ⬇️ Register Teacher Routes
app.use("/api/teachers", teacherRoutes);

// ⬇️ Register Subprogram Routes
app.use("/api/subprograms", subprogramRoutes);

// ⬇️ Register Course Routes
app.use("/api/courses", courseRoutes);

// ⬇️ Register Class Routes
app.use("/api/classes", classRoutes);

// ⬇️ Register Auth Routes (Login, etc.)
app.use("/api/auth", authRoutes);

// ⬇️ Register Placement Test Routes
app.use("/api/placement-tests", placementTestRoutes);

// ⬇️ Register Proficiency Test Routes
app.use("/api/proficiency-tests", proficiencyTestRoutes);

// ⬇️ Register IELTS/TOEFL Routes
app.use("/api/ielts-toefl", ieltsToeflRoutes);

// ⬇️ Register Admin Routes
app.use("/api/admins", adminRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

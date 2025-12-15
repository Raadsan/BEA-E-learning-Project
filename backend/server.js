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
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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

// ⬇️ Register Attendance Routes (NEW)
app.use("/api/attendance", attendanceRoutes);
// ⬇️ Register Admin Routes
app.use("/api/admins", adminRoutes);

// ⬇️ Register User Routes (All users: admins, teachers, students)
app.use("/api/users", userRoutes);

// ⬇️ Register Placement Test Routes
import placementTestRoutes from "./routes/placementTestRoutes.js";
app.use("/api/placement-tests", placementTestRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

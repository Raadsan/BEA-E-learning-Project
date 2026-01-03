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
import userRoutes from "./routes/userRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

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

// ⬇️ Register Placement Test Routes
app.use("/api/placement-tests", placementTestRoutes);

// ⬇️ Register Proficiency Test Routes
app.use("/api/proficiency-tests", proficiencyTestRoutes);

// ⬇️ Register IELTS/TOEFL Routes
app.use("/api/ielts-toefl", ieltsToeflRoutes);

// ⬇️ Register Admin Routes
app.use("/api/admins", adminRoutes);

// ⬇️ Register User Routes
app.use("/api/users", userRoutes);

// ⬇️ Register Assignment Routes
app.use("/api/assignments", assignmentRoutes);

// ⬇️ Register Payment Routes
app.use("/api/payments", paymentRoutes);

// ⬇️ Register Attendance Routes
app.use("/api/attendance", attendanceRoutes);

// ⬇️ Register Announcement Routes
app.use("/api/announcements", announcementRoutes);

// ⬇️ Register News/Events Routes
import newsRoutes from "./routes/newsRoutes.js";
app.use("/api/news", newsRoutes);

// ⬇️ Register Material Routes
app.use("/api/materials", materialRoutes);

// ⬇️ Register Upload Routes
app.use("/api/uploads", uploadRoutes);

// ⬇️ Register Notification Routes
import notificationRoutes from "./routes/notificationRoutes.js";
app.use("/api/notifications", notificationRoutes);

// ⬇️ Register Session Request Routes
import sessionRequestRoutes from "./routes/sessionRequestRoutes.js";
app.use("/api/session-requests", sessionRequestRoutes);

// ⬇️ Register Freezing Request Routes
import freezingRoutes from "./routes/freezingRoutes.js";
app.use("/api/freezing-requests", freezingRoutes);

// ⬇️ Register Timetable Routes
import timetableRoutes from "./routes/timetableRoutes.js";
app.use("/api/timetables", timetableRoutes);

// ⬇️ Register Event Routes (Monthly Calendar)
import eventRoutes from "./routes/eventRoutes.js";
app.use("/api/events", eventRoutes);


// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

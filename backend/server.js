import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import path from "path";
import cors from "cors";
import db from "./database/dbconfig.js";
import programRoutes from "./routes/programRoutes.js";

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

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

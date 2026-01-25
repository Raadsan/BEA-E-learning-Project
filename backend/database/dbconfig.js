import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Use createPool instead of createConnection for better handling of concurrent requests
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
});

// Disable ONLY_FULL_GROUP_BY to prevent strict mode errors
db.on('connection', function (connection) {
  connection.query('SET sql_mode=(SELECT REPLACE(@@sql_mode,"ONLY_FULL_GROUP_BY",""))');
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release();
  }
});

export default db;

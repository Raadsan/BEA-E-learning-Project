// Test script for email functionality
// Run with: node test-email.js
// Make sure the backend server is running first!

import http from "http";

const testData = {
  name: "Abdulahi",
  email: "test@gmail.com",
  phone: "6123456",
  message: "Hello! This is a test."
};

const postData = JSON.stringify(testData);

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/contact",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log("✅ Email sent successfully!");
        console.log("Response:", result);
      } else {
        console.error("❌ Email failed to send");
        console.error("Status:", res.statusCode);
        console.error("Response:", result);
      }
    } catch (err) {
      console.error("❌ Error parsing response:", err);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request failed:", error.message);
  console.error("Make sure the backend server is running on http://localhost:5000");
});

req.write(postData);
req.end();


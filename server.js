
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to receive JSON requests.
app.use(express.json());

// Serve the FFineXX website from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Basic server health check.
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    app: "FFineXX",
    message: "FFineXX server is running"
  });
});

// Start the server.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`FFineXX is running on port ${PORT}`);
});

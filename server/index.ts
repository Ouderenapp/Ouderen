import express from "express";

const app = express();
app.use(express.json());

// Basic health check endpoint
app.get("/health", (req, res) => {
  console.log("Health check endpoint called");
  res.status(200).json({ status: "ok" });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Start server
console.log("Starting server...");
const port = 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server started successfully on http://0.0.0.0:${port}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
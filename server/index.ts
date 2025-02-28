import express, { type Request, Response, NextFunction } from "express";
import { log } from "./vite";
import { connectDB } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic health check endpoint
app.get("/health", (req, res) => {
  console.log("Health check endpoint called");
  res.status(200).json({ status: "ok" });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

(async () => {
  try {
    console.log("Starting server initialization...");
    log("Starting server setup...");

    // Connect to MongoDB
    try {
      await connectDB();
      console.log("MongoDB connection successful");
      log("MongoDB connection verified");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      process.exit(1);
    }

    // Start server
    const port = 5000;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started successfully on http://0.0.0.0:${port}`);
      log(`Server started successfully, serving on port ${port}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
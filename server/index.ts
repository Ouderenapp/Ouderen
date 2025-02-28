console.log("Starting server initialization - " + new Date().toISOString());

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
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

// Error handlers for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

(async () => {
  try {
    console.log("Starting server setup...");
    log("Starting server initialization");

    // Connect to MongoDB
    try {
      await connectDB();
      console.log("MongoDB connection successful");
      log("MongoDB connection verified");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      process.exit(1);
    }

    // Set up authentication before routes
    try {
      setupAuth(app);
      log("Authentication setup complete");
      console.log("Authentication configured successfully");
    } catch (error) {
      console.error("Authentication setup failed:", error);
      process.exit(1);
    }

    // Register routes
    try {
      const server = await registerRoutes(app);
      log("Routes registered successfully");
      console.log("API routes registered");

      // Global error handler
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Server error:", err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });

      // Start server
      const port = 5000;
      server.listen(port, () => {
        console.log(`Server started successfully on port ${port}`);
        log(`Server started successfully, serving on port ${port}`);
      });

    } catch (error) {
      console.error("Failed to register routes:", error);
      process.exit(1);
    }

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();